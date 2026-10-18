---
title: The OSI layers in practice
minutes: 14
---

## In one minute
- The OSI model is a shared vocabulary, not a description of the software you run. The internet actually runs the TCP/IP stack, which uses four or five layers. In system design, people say "L4" and "L7" because the OSI numbers name what a component can *see*.
- A device can only decide on headers it parses: a switch sees MACs, a router IP prefixes, an L4 balancer the 5-tuple, and only an L7 proxy sees URLs, cookies and gRPC methods. Choosing the layer chooses capabilities, cost and failure modes.
- Every layer wraps the payload in another header. Overlays, tunnels and VPNs add more, and the total must fit the path MTU. Most "small requests work, large ones hang" incidents are layer-budget problems.
- The layers leak in practice. NAT rewrites L4 ports inside an L3 device, TLS sits in no clean layer, and QUIC merges transport and encryption in user space because middleboxes ossified TCP.
- Debug bottom up: link, route, port, TLS, application. Each layer's tool (`ip link`, `traceroute`, `ss`, `openssl s_client`, `curl -v`) rules out one class of cause.

## How it works

### Seven names, four implementations
OSI defines physical (1), data link (2), network (3), transport (4), session (5), presentation (6) and application (7). The TCP/IP stack that actually shipped has link, internet, transport and application ([RFC 1122](https://www.rfc-editor.org/rfc/rfc1122)). Sessions live in applications (cookies, gRPC streams), and presentation lives in libraries (TLS, protobuf, gzip). So "layer 7" means "anything above transport, as parsed by a proxy". The numbers survive because they answer a design-review question precisely: what does this component read, and what does it treat as opaque bytes?

### What each layer lets a box see
A **layer 2 switch** reads the destination MAC and forwards the frame out of the port where it learned that MAC. A loop or broadcast storm crosses the whole broadcast domain.

A **layer 3 router** reads the destination IP, does a longest-prefix match, decrements TTL and forwards. Equal-cost multipath (ECMP) spreads flows across links by hashing header fields.

A **layer 4 load balancer** reads the protocol and ports as well, so it can pin a whole connection (the 5-tuple: source IP, source port, destination IP, destination port, protocol) to one backend. Pass-through designs (Maglev, Katran, AWS Network Load Balancer) forward packets without terminating TCP; others terminate it and open a second connection. Pass-through balancers reach backends either by rewriting only the destination MAC (direct server return, which needs one shared layer 2 domain) or by wrapping each packet in GRE, which adds 24 bytes and can push a full-size packet past the MTU ([Google SRE book, ch. 19](https://sre.google/sre-book/load-balancing-frontend/)). Neither kind sees the HTTP path.

A **layer 7 proxy** (Envoy, NGINX, HAProxy in HTTP mode, AWS Application Load Balancer) terminates TCP and usually TLS, parses the request, and can route by host, path, header or gRPC method, retry, authenticate and emit per-request metrics. The price is two connections per client, TLS crypto and more CPU per request.

### Encapsulation and the MTU budget
Sending data pushes headers in front of it: TLS record framing (a 5-byte header, plus in TLS 1.3 a 1-byte inner content type and a 16-byte AEAD tag, per [RFC 9846](https://www.rfc-editor.org/rfc/rfc9846)), TCP (20 bytes, usually 32 with timestamps), IPv4 (20) or IPv6 (40), and Ethernet (14 plus a 4-byte frame check sequence). The IP packet must fit the MTU of every link on the path, usually 1,500 bytes. Tunnels nest whole packets: VXLAN, common in Kubernetes overlays, adds 50 bytes, WireGuard 60 over IPv4 and 80 over IPv6, GRE 24.

Fragmentation is slow, and only the first fragment carries ports, so TCP sets Don't Fragment and relies on Path MTU Discovery. A router that cannot forward the packet drops it and returns ICMP "fragmentation needed" (IPv4) or "packet too big" (IPv6, where routers never fragment). If a firewall drops that ICMP, the sender never learns, and large packets vanish silently: a PMTUD black hole.

The robust fix stops trusting ICMP. With packetization-layer PMTUD, the transport sends probes of increasing size and learns the path MTU from which ones are acknowledged ([RFC 8899](https://www.rfc-editor.org/rfc/rfc8899)). Linux TCP does this when `tcp_mtu_probing` is 1 (only after it suspects a black hole) or 2 (always) ([kernel ip-sysctl](https://docs.kernel.org/networking/ip-sysctl.html)). QUIC refuses paths that can't carry a 1,200-byte UDP payload and may probe upward from there the same way ([RFC 9000](https://www.rfc-editor.org/rfc/rfc9000)).

### Where the layering breaks
NAT is an L3 box rewriting L4 ports. TLS fits no layer cleanly. VXLAN carries L2 frames inside UDP. Middleboxes that assumed what TCP headers look like froze TCP, which is a large part of why QUIC encrypts its transport header and runs over UDP.

## Down the stack

### Layer 1: The contract
Each layer serves the one above and treats its bytes as opaque. Ethernet delivers a CRC-checked frame on one segment or drops it, IP forwards best-effort, TCP provides an ordered byte stream, TLS adds confidentiality and integrity. Infrastructure contracts can be stated precisely enough to test. A pass-through L4 balancer promises that all packets of a 5-tuple reach the same backend while the backend set is stable. An L7 proxy promises per-request routing and offers no affinity unless configured. A tunnel promises to carry inner packets up to its advertised MTU and nothing larger.

### Layer 2: The mechanism
In Linux, a packet is an `sk_buff` with `head`, `data`, `tail` and `end` pointers into one buffer. Each layer prepends its header with `skb_push`, which moves the `data` pointer backwards into headroom reserved in advance, so encapsulation needs no copy ([kernel sk_buff docs](https://docs.kernel.org/networking/skbuff.html)). On receive, `skb_pull` advances past each header as the stack climbs. Netfilter hooks (`PREROUTING`, `INPUT`, `FORWARD`, `OUTPUT`, `POSTROUTING`) are where iptables or nftables, conntrack and NAT act, at the IP layer but with knowledge of ports.

The 20-byte IPv4 header holds version and length, DSCP/ECN, total length, identification, flags and fragment offset, TTL, protocol (6 TCP, 17 UDP), a checksum and the two addresses. The checksum is the ones' complement of the ones' complement sum of the header's 16-bit words, which lets a router patch it incrementally after decrementing TTL ([RFC 1624](https://www.rfc-editor.org/rfc/rfc1624)). Envoy mirrors the split: network filters (`tcp_proxy`, the TLS inspector reading SNI) work per connection, HTTP filters per request.

### Layer 3: The machine
A 10 Gbps link carries about 812,000 full-size 1,500-byte packets per second, or 14.88 million minimum-size 64-byte frames. Per-packet work sets the CPU cost, so NICs offload layers: checksum offload, TSO/GSO (the kernel hands down a 64 KB super-segment that the NIC slices into MSS-sized packets), GRO (merging arriving segments), and RSS, which hashes the 5-tuple to pick a receive queue and core, an L4 decision in silicon.

Moving up multiplies cost. An XDP or DPDK L4 balancer forwards millions of packets per second per core. An L7 proxy pays for TLS handshakes (roughly 0.1 to 0.3 ms of CPU each for ECDHE P-256), header parsing and socket buffers on both sides, and typically serves tens of thousands of HTTPS requests per second per core.

### Why it's built this way
1. No single design could cover every medium and application, so layers change independently: Ethernet went from 10 Mbps to 400 Gbps without HTTP noticing.
2. Independent layers need their own addressing, so every layer adds a header that costs MTU bytes and per-packet work.
3. Parsing deeper costs more CPU and state, so the network core stays at L3 and expensive L7 work moves to the edges, where it can be scaled out.
4. Middleboxes optimised by reading layers they did not own, which froze those layers, so new protocols (QUIC) encrypt their headers to keep the freedom to change.

## Diagram

```mermaid
flowchart LR
    A["App: HTTP request"] --> T["TLS record"]
    T --> P["TCP segment: ports, seq"]
    P --> I["IP packet: src, dst, TTL"]
    I --> E["Ethernet frame: MACs"]
    E --> SW["Switch reads L2"]
    SW --> R["Router reads L3"]
    R --> L4["L4 LB reads 5-tuple"]
    L4 --> L7["L7 proxy ends TLS, reads path"]
    L7 --> S["Service"]
```

## Worked example
A Kubernetes cluster runs a VXLAN overlay on a 1,500-byte cloud network, and pods reach a partner over WireGuard inside the overlay.

- Underlay MTU 1,500; VXLAN takes 50, so pod interfaces must be 1,450.
- WireGuard over IPv4 takes 60, so the tunnel interface must be 1,390.
- TCP payload per segment: 1,390 minus 20 (IP) minus 32 (TCP with timestamps) is 1,338 bytes.

Efficiency falls from 1,448/1,500 (96.5%) to 1,338/1,500 (89.2%); at 2 Gbps that is about 150 Mbps of extra headers.

The incident: someone leaves WireGuard at its default 1,420. Small API calls work, but a response carrying a 5 KB certificate chain hangs. A 1,420-byte inner packet plus 60 is 1,480, which exceeds the 1,450 pod MTU; the overlay drops it, and the ICMP reply is blocked by a security group. `ping -M do -s 1362` succeeds while `-s 1400` fails, which confirms it. Fix the MTU on each nested interface, clamp MSS on the tunnel (`--clamp-mss-to-pmtu`), and allow ICMP type 3 code 4 and ICMPv6 type 2.

The layer choice also shows at the balancer. With 40 gRPC clients each holding one HTTP/2 connection through an L4 balancer to 10 backends, a client sending 5,000 requests per second puts all of them on one backend. An L7 proxy spreads per request, at the cost of TLS termination and about 1 ms.

## In the wild
- **Cloudflare, 2019: the price of parsing at L7.** On 2 July, a new WAF rule contained a regular expression that backtracked catastrophically. It drove CPU to nearly 100% on every core serving HTTP and HTTPS worldwide, and the edge returned 502s for about 27 minutes until the WAF was disabled globally. Layers below were fine; only the component that parses requests failed. Afterwards Cloudflare restored a removed CPU guard, moved to regex engines with run-time guarantees, and staged rule rollouts ([Cloudflare](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/)).
- **Cloudflare, 2020: one L3 line drops half the traffic.** On 17 July, a one-line router change in Atlanta, meant to shed backbone load, made the router advertise all its BGP routes with local-preference 200, above the 100 used for local servers. Traffic from 19 locations converged on Atlanta and overloaded it, and overall traffic fell by about 50% for 27 minutes. The fixes were a local-preference that stops one site attracting others' traffic and maximum-prefix limits on backbone sessions ([Cloudflare](https://blog.cloudflare.com/cloudflare-outage-on-july-17-2020/)).

## Trade-offs

| Option | Strengths | Weaknesses | Choose when |
| --- | --- | --- | --- |
| L3 (ECMP, anycast) | Line rate in hardware, no per-flow state | Hash-based spread only, no health detail | Spreading across L4 balancers or PoPs |
| L4 pass-through LB | Millions of pps, preserves client IP, TLS stays end to end | Balances connections not requests, cannot route by path | Raw TCP/UDP services, front tier of a large edge |
| L4 terminating LB | Hides backends, can add TLS | Two connections, client IP needs PROXY protocol | Simple TCP services needing a stable endpoint |
| L7 proxy | Per-request routing, retries, auth, rich metrics | CPU for TLS and parsing, more latency, more config surface | HTTP/gRPC APIs, canaries, path routing |
| Sidecar mesh (L7 everywhere) | Uniform mTLS and telemetry | A proxy hop on each side of every call, more memory | Many services and teams that need the same policy |

## Pitfalls in production
- **PMTUD black holes.** Firewalls that drop all ICMP break Path MTU Discovery, so only large transfers hang. Allow "fragmentation needed" and "packet too big", and clamp MSS on tunnels.
- **Health checks at the wrong layer.** A TCP connect check passes while the app returns 500 for everything. Check at the layer users depend on.
- **Lost client IP after termination.** Once a proxy terminates TCP, backends see the proxy's address, and rate limits and audit logs break. Use `X-Forwarded-For` (trusting only your own proxies) or the PROXY protocol at L4, which prepends the original addresses as a short header before the first byte of the stream ([PROXY protocol spec](https://www.haproxy.org/download/3.0/doc/proxy-protocol.txt)).
- **Long-lived connections behind L4.** HTTP/2, gRPC and database pools stay pinned to old backends, so new instances sit idle after a scale-out. Balance at L7 or cap connection age.

## Leadership lens
- In reviews, ask "at which layer is this decision made, and what can that component see?" It exposes plans to route by user ID through an L4 balancer or to rate-limit by IP behind a proxy.
- Layers map to ownership: network teams own L2 and L3, platform teams own the balancers and mesh, and product teams own L7 semantics. Incidents at the boundaries, such as MTU and ICMP, need a named owner.
- L7 everywhere has a recurring bill. Sidecars add CPU, memory and latency on every hop. Price that against the policy and telemetry they provide before adopting a mesh.

## Check yourself
1. Why can a pass-through L4 load balancer not send `/images/*` to a different pool than `/api/*`?
   **Answer:** The path is inside the HTTP request, usually inside TLS. A pass-through L4 device forwards packets by 5-tuple without terminating TCP or decrypting, so it never sees the path.
2. A VPN user can load small pages but large downloads stall. Which layers would you suspect first and why?
   **Answer:** L3 MTU and ICMP. The tunnel adds headers so full-size packets no longer fit, and if ICMP "fragmentation needed" is blocked, the sender never shrinks its segments.
3. Why does QUIC encrypt most of its transport header when TCP does not?
   **Answer:** Middleboxes inspected and made assumptions about TCP headers, which made TCP almost impossible to evolve. Encrypting the header stops middleboxes from depending on it and keeps the protocol changeable.

## Practice
**Task:** Implement encapsulation and decapsulation for IPv4 and UDP. `ipv4_checksum(header)` returns the 16-bit ones' complement checksum of a byte string (an even length is guaranteed). `encapsulate(src_ip, dst_ip, src_port, dst_port, payload, ttl)` returns a packet: a 20-byte IPv4 header (version 4, IHL 5, TOS 0, total length, identification 0, flags with Don't Fragment set (`0x4000`), the given TTL, protocol 17, a correct checksum, and the addresses), then an 8-byte UDP header (ports, UDP length, checksum 0), then the payload. `decapsulate(packet)` returns `src`, `dst`, `ttl`, `protocol`, `src_port`, `dst_port` and `payload`. It must reject a packet that is shorter than 28 bytes, has a version other than 4, has a bad header checksum, or whose total length differs from the byte count.

```python starter
def ipv4_checksum(header):
    # TODO
    raise NotImplementedError

def encapsulate(src_ip, dst_ip, src_port, dst_port, payload, ttl=64):
    # TODO: return bytes
    raise NotImplementedError

def decapsulate(packet):
    # TODO: return dict, raise ValueError on a bad packet
    raise NotImplementedError
```

```python tests
def test_known_checksum():
    h = bytes.fromhex("450000730000400040110000c0a80001c0a800c7")
    assert ipv4_checksum(h) == 0xB861

def test_header_layout():
    p = encapsulate("10.0.0.1", "10.0.0.2", 5000, 53, b"hi", 64)
    assert len(p) == 30
    assert p[0] == 0x45 and p[9] == 17 and p[8] == 64
    assert p[2:4] == bytes([0, 30]) and p[6:8] == bytes([0x40, 0])
    assert p[24:26] == bytes([0, 10]), "UDP length = 8 + payload"

def test_checksum_verifies_to_zero():
    p = encapsulate("192.168.1.10", "8.8.8.8", 40000, 443, b"x" * 11, 32)
    assert ipv4_checksum(p[:20]) == 0

def test_round_trip():
    p = encapsulate("172.16.5.4", "10.1.2.3", 1234, 8080, b"hello world", 7)
    d = decapsulate(p)
    assert d == {"src": "172.16.5.4", "dst": "10.1.2.3", "ttl": 7, "protocol": 17,
                 "src_port": 1234, "dst_port": 8080, "payload": b"hello world"}

def test_rejects_corruption():
    p = bytearray(encapsulate("10.0.0.1", "10.0.0.2", 1, 2, b"abc", 64))
    p[8] = 63
    try:
        decapsulate(bytes(p))
        assert False, "bad checksum accepted"
    except ValueError:
        pass

def test_rejects_short_and_truncated():
    for bad in (b"\x45" * 10, encapsulate("10.0.0.1", "10.0.0.2", 1, 2, b"abcd", 64)[:-1]):
        try:
            decapsulate(bad)
            assert False, "bad packet accepted"
        except ValueError:
            pass
```

```python solution
import struct

def ipv4_checksum(header):
    total = 0
    for i in range(0, len(header), 2):
        total += (header[i] << 8) | header[i + 1]
    while total >> 16:
        total = (total & 0xFFFF) + (total >> 16)
    return (~total) & 0xFFFF

def _ip(s):
    return bytes(int(x) for x in s.split("."))

def encapsulate(src_ip, dst_ip, src_port, dst_port, payload, ttl=64):
    udp_len = 8 + len(payload)
    total = 20 + udp_len
    hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, total, 0, 0x4000, ttl, 17, 0,
                      _ip(src_ip), _ip(dst_ip))
    hdr = hdr[:10] + struct.pack("!H", ipv4_checksum(hdr)) + hdr[12:]
    return hdr + struct.pack("!HHHH", src_port, dst_port, udp_len, 0) + payload

def decapsulate(packet):
    if len(packet) < 28:
        raise ValueError("too short")
    if packet[0] >> 4 != 4:
        raise ValueError("not IPv4")
    if ipv4_checksum(packet[:20]) != 0:
        raise ValueError("bad checksum")
    total = struct.unpack("!H", packet[2:4])[0]
    if total != len(packet):
        raise ValueError("length mismatch")
    sp, dp = struct.unpack("!HH", packet[20:24])
    return {"src": ".".join(str(b) for b in packet[12:16]),
            "dst": ".".join(str(b) for b in packet[16:20]),
            "ttl": packet[8], "protocol": packet[9],
            "src_port": sp, "dst_port": dp, "payload": bytes(packet[28:])}
```

```typescript starter
export interface Decoded {
  src: string; dst: string; ttl: number; protocol: number;
  srcPort: number; dstPort: number; payload: number[];
}

export function ipv4Checksum(header: number[]): number {
  throw new Error("TODO");
}

export function encapsulate(srcIp: string, dstIp: string, srcPort: number, dstPort: number,
                            payload: number[], ttl: number): number[] {
  throw new Error("TODO");
}

// Throws an Error on a bad packet.
export function decapsulate(packet: number[]): Decoded {
  throw new Error("TODO");
}
```

```typescript tests
function hex(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i += 2) out.push(parseInt(s.slice(i, i + 2), 16));
  return out;
}
function bytesOf(s: string): number[] { return Array.from(s).map((c) => c.charCodeAt(0)); }
function throws(fn: () => void): boolean { try { fn(); return false; } catch (e) { return true; } }

test("known checksum", () => {
  assertEqual(ipv4Checksum(hex("450000730000400040110000c0a80001c0a800c7")), 0xb861);
});
test("header layout", () => {
  const p = encapsulate("10.0.0.1", "10.0.0.2", 5000, 53, bytesOf("hi"), 64);
  assertEqual(p.length, 30);
  assert(p[0] === 0x45 && p[9] === 17 && p[8] === 64, "version, protocol, ttl");
  assertEqual(p.slice(2, 4), [0, 30]);
  assertEqual(p.slice(6, 8), [0x40, 0]);
  assertEqual(p.slice(24, 26), [0, 10], "UDP length");
});
test("checksum verifies to zero", () => {
  const p = encapsulate("192.168.1.10", "8.8.8.8", 40000, 443, bytesOf("xxxxxxxxxxx"), 32);
  assertEqual(ipv4Checksum(p.slice(0, 20)), 0);
});
test("round trip", () => {
  const p = encapsulate("172.16.5.4", "10.1.2.3", 1234, 8080, bytesOf("hello world"), 7);
  assertEqual(decapsulate(p), { src: "172.16.5.4", dst: "10.1.2.3", ttl: 7, protocol: 17,
    srcPort: 1234, dstPort: 8080, payload: bytesOf("hello world") });
});
test("rejects corruption", () => {
  const p = encapsulate("10.0.0.1", "10.0.0.2", 1, 2, bytesOf("abc"), 64);
  p[8] = 63;
  assert(throws(() => decapsulate(p)), "bad checksum accepted");
});
test("rejects short and truncated", () => {
  assert(throws(() => decapsulate(new Array(10).fill(0x45))), "short accepted");
  const p = encapsulate("10.0.0.1", "10.0.0.2", 1, 2, bytesOf("abcd"), 64);
  assert(throws(() => decapsulate(p.slice(0, p.length - 1))), "truncated accepted");
});
```

```typescript solution
export interface Decoded {
  src: string; dst: string; ttl: number; protocol: number;
  srcPort: number; dstPort: number; payload: number[];
}

export function ipv4Checksum(header: number[]): number {
  let total = 0;
  for (let i = 0; i < header.length; i += 2) total += (header[i] << 8) | header[i + 1];
  while (total > 0xffff) total = (total & 0xffff) + (total >>> 16);
  return ~total & 0xffff;
}

const u16 = (n: number): number[] => [(n >> 8) & 0xff, n & 0xff];
const ip = (s: string): number[] => s.split(".").map(Number);

export function encapsulate(srcIp: string, dstIp: string, srcPort: number, dstPort: number,
                            payload: number[], ttl: number): number[] {
  const udpLen = 8 + payload.length;
  const hdr = [0x45, 0, ...u16(20 + udpLen), 0, 0, 0x40, 0, ttl, 17, 0, 0, ...ip(srcIp), ...ip(dstIp)];
  const c = ipv4Checksum(hdr);
  hdr[10] = c >> 8;
  hdr[11] = c & 0xff;
  return [...hdr, ...u16(srcPort), ...u16(dstPort), ...u16(udpLen), 0, 0, ...payload];
}

export function decapsulate(packet: number[]): Decoded {
  if (packet.length < 28) throw new Error("too short");
  if (packet[0] >> 4 !== 4) throw new Error("not IPv4");
  if (ipv4Checksum(packet.slice(0, 20)) !== 0) throw new Error("bad checksum");
  if (((packet[2] << 8) | packet[3]) !== packet.length) throw new Error("length mismatch");
  return {
    src: packet.slice(12, 16).join("."), dst: packet.slice(16, 20).join("."),
    ttl: packet[8], protocol: packet[9],
    srcPort: (packet[20] << 8) | packet[21], dstPort: (packet[22] << 8) | packet[23],
    payload: packet.slice(28),
  };
}
```

```go starter
package practice

type Decoded struct {
	Src, Dst         string
	TTL, Protocol    int
	SrcPort, DstPort int
	Payload          []byte
}

func IPv4Checksum(header []byte) uint16 {
	panic("TODO")
}

func Encapsulate(srcIP, dstIP string, srcPort, dstPort int, payload []byte, ttl int) []byte {
	panic("TODO")
}

func Decapsulate(packet []byte) (Decoded, error) {
	panic("TODO")
}
```

```go tests
package practice

import (
	"bytes"
	"encoding/hex"
	"reflect"
	"testing"
)

func TestKnownChecksum(t *testing.T) {
	h, _ := hex.DecodeString("450000730000400040110000c0a80001c0a800c7")
	if got := IPv4Checksum(h); got != 0xb861 {
		t.Fatalf("got %x", got)
	}
}

func TestHeaderLayout(t *testing.T) {
	p := Encapsulate("10.0.0.1", "10.0.0.2", 5000, 53, []byte("hi"), 64)
	if len(p) != 30 || p[0] != 0x45 || p[9] != 17 || p[8] != 64 {
		t.Fatalf("bad header % x", p)
	}
	if !bytes.Equal(p[2:4], []byte{0, 30}) || !bytes.Equal(p[6:8], []byte{0x40, 0}) || !bytes.Equal(p[24:26], []byte{0, 10}) {
		t.Fatalf("bad lengths or flags % x", p)
	}
}

func TestChecksumVerifiesToZero(t *testing.T) {
	p := Encapsulate("192.168.1.10", "8.8.8.8", 40000, 443, []byte("xxxxxxxxxxx"), 32)
	if IPv4Checksum(p[:20]) != 0 {
		t.Fatal("checksum does not verify")
	}
}

func TestRoundTrip(t *testing.T) {
	p := Encapsulate("172.16.5.4", "10.1.2.3", 1234, 8080, []byte("hello world"), 7)
	d, err := Decapsulate(p)
	want := Decoded{"172.16.5.4", "10.1.2.3", 7, 17, 1234, 8080, []byte("hello world")}
	if err != nil || !reflect.DeepEqual(d, want) {
		t.Fatalf("got %+v err %v", d, err)
	}
}

func TestRejects(t *testing.T) {
	p := Encapsulate("10.0.0.1", "10.0.0.2", 1, 2, []byte("abc"), 64)
	p[8] = 63
	if _, err := Decapsulate(p); err == nil {
		t.Fatal("bad checksum accepted")
	}
	if _, err := Decapsulate(bytes.Repeat([]byte{0x45}, 10)); err == nil {
		t.Fatal("short accepted")
	}
	q := Encapsulate("10.0.0.1", "10.0.0.2", 1, 2, []byte("abcd"), 64)
	if _, err := Decapsulate(q[:len(q)-1]); err == nil {
		t.Fatal("truncated accepted")
	}
}
```

```go solution
package practice

import (
	"encoding/binary"
	"errors"
	"fmt"
	"strconv"
	"strings"
)

type Decoded struct {
	Src, Dst         string
	TTL, Protocol    int
	SrcPort, DstPort int
	Payload          []byte
}

func IPv4Checksum(header []byte) uint16 {
	var total uint32
	for i := 0; i+1 < len(header); i += 2 {
		total += uint32(header[i])<<8 | uint32(header[i+1])
	}
	for total>>16 != 0 {
		total = total&0xffff + total>>16
	}
	return ^uint16(total)
}

func ip(s string) []byte {
	out := make([]byte, 0, 4)
	for _, part := range strings.Split(s, ".") {
		n, _ := strconv.Atoi(part)
		out = append(out, byte(n))
	}
	return out
}

func Encapsulate(srcIP, dstIP string, srcPort, dstPort int, payload []byte, ttl int) []byte {
	udpLen := 8 + len(payload)
	p := make([]byte, 28, 20+udpLen)
	p[0] = 0x45
	binary.BigEndian.PutUint16(p[2:], uint16(20+udpLen))
	binary.BigEndian.PutUint16(p[6:], 0x4000)
	p[8], p[9] = byte(ttl), 17
	copy(p[12:16], ip(srcIP))
	copy(p[16:20], ip(dstIP))
	binary.BigEndian.PutUint16(p[10:], IPv4Checksum(p[:20]))
	binary.BigEndian.PutUint16(p[20:], uint16(srcPort))
	binary.BigEndian.PutUint16(p[22:], uint16(dstPort))
	binary.BigEndian.PutUint16(p[24:], uint16(udpLen))
	return append(p, payload...)
}

func dotted(b []byte) string {
	return fmt.Sprintf("%d.%d.%d.%d", b[0], b[1], b[2], b[3])
}

func Decapsulate(packet []byte) (Decoded, error) {
	if len(packet) < 28 {
		return Decoded{}, errors.New("too short")
	}
	if packet[0]>>4 != 4 {
		return Decoded{}, errors.New("not IPv4")
	}
	if IPv4Checksum(packet[:20]) != 0 {
		return Decoded{}, errors.New("bad checksum")
	}
	if int(binary.BigEndian.Uint16(packet[2:])) != len(packet) {
		return Decoded{}, errors.New("length mismatch")
	}
	return Decoded{
		Src: dotted(packet[12:16]), Dst: dotted(packet[16:20]),
		TTL: int(packet[8]), Protocol: int(packet[9]),
		SrcPort: int(binary.BigEndian.Uint16(packet[20:])), DstPort: int(binary.BigEndian.Uint16(packet[22:])),
		Payload: append([]byte{}, packet[28:]...),
	}, nil
}
```

## Mock interview
**Prompt:** You are designing the ingress for a platform serving 300,000 HTTPS requests per second from mobile clients, mostly gRPC over HTTP/2, plus a raw TCP protocol for IoT devices. Walk through which layers your load-balancing tiers operate at and why.

- Follow-up: After a scale-out, new gRPC backends receive almost no traffic for an hour. What is happening at which layer?
- Follow-up: Partner traffic over a site-to-site VPN times out only on large responses. How do you find and fix it?
- Follow-up: Security wants the backends to see the real client IP for every request. What changes at L4 and at L7?

**A strong answer covers:**
- A tiered edge: L3 ECMP or anycast to a pass-through L4 tier, then L7 proxies for HTTP/gRPC. The IoT TCP protocol stays at L4.
- Why L4 balances connections, not requests, and how long-lived HTTP/2 connections cause skew. Fixes are L7 balancing or a maximum connection age.
- MTU and ICMP across tunnels: PMTUD black holes, MSS clamping, and DF-ping tests.
- Client IP preservation: DSR or pass-through at L4, the PROXY protocol, and `X-Forwarded-For` with a trusted hop list at L7.

## Sources and further study
**Primary**
- [RFC 8899: Packetization Layer Path MTU Discovery for Datagram Transports](https://www.rfc-editor.org/rfc/rfc8899): probing for the path MTU without relying on ICMP.
- [RFC 1624: Incremental Internet Checksum](https://www.rfc-editor.org/rfc/rfc1624): why routers can patch the IPv4 checksum after changing TTL.
- [The PROXY protocol, versions 1 and 2](https://www.haproxy.org/download/3.0/doc/proxy-protocol.txt): carrying client addresses through L4 proxies.

**Systems docs**
- [Linux ip-sysctl](https://docs.kernel.org/networking/ip-sysctl.html): `tcp_mtu_probing`, `tcp_base_mss` and the other knobs that decide how the stack copes with MTU problems.
- [Google SRE book, chapter 19: Load Balancing at the Frontend](https://sre.google/sre-book/load-balancing-frontend/): DNS, L4 balancing with consistent hashing, GRE encapsulation and its MTU cost.

**Books**
- *Computer Networking: A Top-Down Approach*, Kurose and Ross, section 1.5 "Protocol Layers and Their Service Models": the five-layer Internet stack against the seven-layer OSI model.
- [*Computer Networks: A Systems Approach*, Peterson and Davie, section 1.3 "Architecture"](https://book.systemsapproach.org/foundation/architecture.html): free online; layering, encapsulation and the OSI versus Internet architecture.
- *TCP/IP Illustrated, Volume 1* (2nd edition), Fall and Stevens, chapter 1 "Introduction": architectural principles, layering and encapsulation as implemented.

**Other curricula**
- [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer): shows an OSI diagram at the top of its Communication section and moves straight on to HTTP, TCP and UDP.
- [roadmap.sh: Software Architect](https://roadmap.sh/software-architect): treats OSI and TCP/IP as an interoperability vocabulary (seven layers versus four), with no L4/L7 or MTU discussion.

## Watch
- [The OSI Model by Example (Hussein Nasser)](https://www.youtube.com/watch?v=eNF9z5JNl-A): walks a real request through each layer from a backend engineer's point of view.
- [OSI Model vs TCP/IP Model: Key Differences Explained (Engineering Funda)](https://www.youtube.com/watch?v=oEMfhk5mqUY): maps the seven OSI layers onto the stack that actually shipped.

## Free resources
- [RFC 1122: Requirements for Internet Hosts](https://www.rfc-editor.org/rfc/rfc1122): the TCP/IP layering as implemented, with what each layer must and may do.
- [RFC 3439: Some Internet Architectural Guidelines and Philosophy](https://www.rfc-editor.org/rfc/rfc3439): includes the argument that strict layering can be harmful.
- [End-to-End Arguments in System Design (Saltzer, Reed, Clark)](https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf): the classic paper on which layer should own a function.
- [Path MTU discovery in practice (Cloudflare blog)](https://blog.cloudflare.com/path-mtu-discovery-in-practice/): how PMTUD breaks with anycast and ECMP, and how it was fixed.
- [struct sk_buff (Linux kernel docs)](https://docs.kernel.org/networking/skbuff.html): how the kernel represents a packet as it moves between layers.
- [OSI model (Wikipedia)](https://en.wikipedia.org/wiki/OSI_model): background, history and the layer-by-layer reference.

'use strict';
(function () {
  function T(a, b) {
    let c = [],
      d = '';
    b = a.readBits([8, 16, 16][b]);
    for (let d = 0; d < b; d++) {
      let b = a.readBits(8);
      c.push(b);
    }
    try {
      d += decodeURIComponent(
        c.map((a) => `%${('0' + a.toString(16)).substr(-2)}`).join('')
      );
    } catch (e) {}
    return { bytes: c, text: d };
  }
  function U(a, b) {
    a = new V(a);
    b = 9 >= b ? 0 : 26 >= b ? 1 : 2;
    let c = { text: '', bytes: [], chunks: [] };
    for (; 4 <= a.available(); ) {
      var d = a.readBits(4);
      if (d === y.Terminator) return c;
      if (d === y.ECI)
        0 === a.readBits(1)
          ? c.chunks.push({ type: t.ECI, assignmentNumber: a.readBits(7) })
          : 0 === a.readBits(1)
          ? c.chunks.push({ type: t.ECI, assignmentNumber: a.readBits(14) })
          : 0 === a.readBits(1)
          ? c.chunks.push({ type: t.ECI, assignmentNumber: a.readBits(21) })
          : c.chunks.push({ type: t.ECI, assignmentNumber: -1 });
      else if (d === y.Numeric) {
        var e = a;
        d = [];
        for (var f = '', g = e.readBits([10, 12, 14][b]); 3 <= g; ) {
          var h = e.readBits(10);
          if (1e3 <= h) throw Error('Invalid numeric value above 999');
          var k = Math.floor(h / 100),
            l = Math.floor(h / 10) % 10;
          h %= 10;
          d.push(48 + k, 48 + l, 48 + h);
          f += k.toString() + l.toString() + h.toString();
          g -= 3;
        }
        if (2 === g) {
          g = e.readBits(7);
          if (100 <= g) throw Error('Invalid numeric value above 99');
          e = Math.floor(g / 10);
          g %= 10;
          d.push(48 + e, 48 + g);
          f += e.toString() + g.toString();
        } else if (1 === g) {
          e = e.readBits(4);
          if (10 <= e) throw Error('Invalid numeric value above 9');
          d.push(48 + e);
          f += e.toString();
        }
        d = { bytes: d, text: f };
        c.text += d.text;
        c.bytes.push(...d.bytes);
        c.chunks.push({ type: t.Numeric, text: d.text });
      } else if (d === y.Alphanumeric) {
        e = a;
        d = [];
        f = '';
        for (g = e.readBits([9, 11, 13][b]); 2 <= g; )
          (l = e.readBits(11)),
            (k = Math.floor(l / 45)),
            (l %= 45),
            d.push(B[k].charCodeAt(0), B[l].charCodeAt(0)),
            (f += B[k] + B[l]),
            (g -= 2);
        1 === g &&
          ((e = e.readBits(6)), d.push(B[e].charCodeAt(0)), (f += B[e]));
        d = { bytes: d, text: f };
        c.text += d.text;
        c.bytes.push(...d.bytes);
        c.chunks.push({ type: t.Alphanumeric, text: d.text });
      } else if (d === y.Byte)
        (d = T(a, b)),
          (c.text += d.text),
          c.bytes.push(...d.bytes),
          c.chunks.push({ type: t.Byte, bytes: d.bytes, text: d.text });
      else if (d === y.Kanji) {
        f = a;
        d = [];
        e = f.readBits([8, 10, 12][b]);
        for (g = 0; g < e; g++)
          (k = f.readBits(13)),
            (k = (Math.floor(k / 192) << 8) | k % 192),
            (k = 7936 > k ? k + 33088 : k + 49472),
            d.push(k >> 8, k & 255);
        f = new TextDecoder('shift-jis').decode(Uint8Array.from(d));
        d = { bytes: d, text: f };
        c.text += d.text;
        c.bytes.push(...d.bytes);
        c.chunks.push({ type: t.Kanji, bytes: d.bytes, text: d.text });
      }
    }
    if (0 === a.available() || 0 === a.readBits(a.available())) return c;
  }
  function J(a, b) {
    return a ^ b;
  }
  function W(a, b, c, d) {
    b.degree() < c.degree() && ([b, c] = [c, b]);
    let e = a.zero;
    for (var f = a.one; c.degree() >= d / 2; ) {
      var g = b;
      let d = e;
      b = c;
      e = f;
      if (b.isZero()) return null;
      c = g;
      f = a.zero;
      g = b.getCoefficient(b.degree());
      for (g = a.inverse(g); c.degree() >= b.degree() && !c.isZero(); ) {
        let d = c.degree() - b.degree(),
          e = a.multiply(c.getCoefficient(c.degree()), g);
        f = f.addOrSubtract(a.buildMonomial(d, e));
        c = c.addOrSubtract(b.multiplyByMonomial(d, e));
      }
      f = f.multiplyPoly(e).addOrSubtract(d);
      if (c.degree() >= b.degree()) return null;
    }
    d = f.getCoefficient(0);
    if (0 === d) return null;
    a = a.inverse(d);
    return [f.multiply(a), c.multiply(a)];
  }
  function X(a, b) {
    let c = new Uint8ClampedArray(a.length);
    c.set(a);
    a = new Y(285, 256, 0);
    var d = new w(a, c),
      e = new Uint8ClampedArray(b),
      f = !1;
    for (var g = 0; g < b; g++) {
      var h = d.evaluateAt(a.exp(g + a.generatorBase));
      e[e.length - 1 - g] = h;
      0 !== h && (f = !0);
    }
    if (!f) return c;
    d = new w(a, e);
    d = W(a, a.buildMonomial(b, 1), d, b);
    if (null === d) return null;
    b = d[0];
    g = b.degree();
    if (1 === g) b = [b.getCoefficient(1)];
    else {
      e = Array(g);
      f = 0;
      for (h = 1; h < a.size && f < g; h++)
        0 === b.evaluateAt(h) && ((e[f] = a.inverse(h)), f++);
      b = f !== g ? null : e;
    }
    if (null == b) return null;
    d = d[1];
    e = b.length;
    f = Array(e);
    for (g = 0; g < e; g++) {
      h = a.inverse(b[g]);
      let c = 1;
      for (let d = 0; d < e; d++)
        g !== d && (c = a.multiply(c, J(1, a.multiply(b[d], h))));
      f[g] = a.multiply(d.evaluateAt(h), a.inverse(c));
      0 !== a.generatorBase && (f[g] = a.multiply(f[g], h));
    }
    d = f;
    for (e = 0; e < b.length; e++) {
      f = c.length - 1 - a.log(b[e]);
      if (0 > f) return null;
      c[f] ^= d[e];
    }
    return c;
  }
  function E(a, b) {
    a ^= b;
    for (b = 0; a; ) b++, (a &= a - 1);
    return b;
  }
  function C(a, b) {
    return (b << 1) | a;
  }
  function Z(a, b, c) {
    c = aa[c.dataMask];
    let d = a.height;
    var e = 17 + 4 * b.versionNumber,
      f = A.createEmpty(e, e);
    f.setRegion(0, 0, 9, 9, !0);
    f.setRegion(e - 8, 0, 8, 9, !0);
    f.setRegion(0, e - 8, 9, 8, !0);
    for (var g of b.alignmentPatternCenters)
      for (var h of b.alignmentPatternCenters)
        (6 === g && 6 === h) ||
          (6 === g && h === e - 7) ||
          (g === e - 7 && 6 === h) ||
          f.setRegion(g - 2, h - 2, 5, 5, !0);
    f.setRegion(6, 9, 1, e - 17, !0);
    f.setRegion(9, 6, e - 17, 1, !0);
    6 < b.versionNumber &&
      (f.setRegion(e - 11, 0, 3, 6, !0), f.setRegion(0, e - 11, 6, 3, !0));
    b = f;
    g = [];
    e = h = 0;
    f = !0;
    for (let k = d - 1; 0 < k; k -= 2) {
      6 === k && k--;
      for (let l = 0; l < d; l++) {
        let q = f ? d - 1 - l : l;
        for (let d = 0; 2 > d; d++) {
          let f = k - d;
          if (!b.get(f, q)) {
            e++;
            let b = a.get(f, q);
            c({ y: q, x: f }) && (b = !b);
            h = (h << 1) | b;
            8 === e && (g.push(h), (h = e = 0));
          }
        }
      }
      f = !f;
    }
    return g;
  }
  function ba(a) {
    var b = a.height,
      c = Math.floor((b - 17) / 4);
    if (6 >= c) return K[c - 1];
    c = 0;
    for (var d = 5; 0 <= d; d--)
      for (var e = b - 9; e >= b - 11; e--) c = C(a.get(e, d), c);
    d = 0;
    for (e = 5; 0 <= e; e--)
      for (let c = b - 9; c >= b - 11; c--) d = C(a.get(e, c), d);
    a = Infinity;
    let f;
    for (let e of K) {
      if (e.infoBits === c || e.infoBits === d) return e;
      b = E(c, e.infoBits);
      b < a && ((f = e), (a = b));
      b = E(d, e.infoBits);
      b < a && ((f = e), (a = b));
    }
    if (3 >= a) return f;
  }
  function ca(a) {
    let b = 0;
    for (var c = 0; 8 >= c; c++) 6 !== c && (b = C(a.get(c, 8), b));
    for (c = 7; 0 <= c; c--) 6 !== c && (b = C(a.get(8, c), b));
    var d = a.height;
    c = 0;
    for (var e = d - 1; e >= d - 7; e--) c = C(a.get(8, e), c);
    for (e = d - 8; e < d; e++) c = C(a.get(e, 8), c);
    a = Infinity;
    d = null;
    for (let { bits: f, formatInfo: g } of da) {
      if (f === b || f === c) return g;
      e = E(b, f);
      e < a && ((d = g), (a = e));
      b !== c && ((e = E(c, f)), e < a && ((d = g), (a = e)));
    }
    return 3 >= a ? d : null;
  }
  function ea(a, b, c) {
    let d = b.errorCorrectionLevels[c],
      e = [],
      f = 0;
    d.ecBlocks.forEach((a) => {
      for (let b = 0; b < a.numBlocks; b++)
        e.push({ numDataCodewords: a.dataCodewordsPerBlock, codewords: [] }),
          (f += a.dataCodewordsPerBlock + d.ecCodewordsPerBlock);
    });
    if (a.length < f) return null;
    a = a.slice(0, f);
    b = d.ecBlocks[0].dataCodewordsPerBlock;
    for (c = 0; c < b; c++) for (var g of e) g.codewords.push(a.shift());
    if (1 < d.ecBlocks.length)
      for (
        g = d.ecBlocks[0].numBlocks, b = d.ecBlocks[1].numBlocks, c = 0;
        c < b;
        c++
      )
        e[g + c].codewords.push(a.shift());
    for (; 0 < a.length; ) for (let b of e) b.codewords.push(a.shift());
    return e;
  }
  function L(a) {
    let b = ba(a);
    if (!b) return null;
    var c = ca(a);
    if (!c) return null;
    a = Z(a, b, c);
    var d = ea(a, b, c.errorCorrectionLevel);
    if (!d) return null;
    c = d.reduce((a, b) => a + b.numDataCodewords, 0);
    c = new Uint8ClampedArray(c);
    a = 0;
    for (let b of d) {
      d = X(b.codewords, b.codewords.length - b.numDataCodewords);
      if (!d) return null;
      for (let e = 0; e < b.numDataCodewords; e++) c[a++] = d[e];
    }
    try {
      return U(c, b.versionNumber);
    } catch (e) {
      return null;
    }
  }
  function M(a, b, c, d) {
    var e = a.x - b.x + c.x - d.x;
    let f = a.y - b.y + c.y - d.y;
    if (0 === e && 0 === f)
      return {
        a11: b.x - a.x,
        a12: b.y - a.y,
        a13: 0,
        a21: c.x - b.x,
        a22: c.y - b.y,
        a23: 0,
        a31: a.x,
        a32: a.y,
        a33: 1,
      };
    {
      let h = b.x - c.x;
      var g = d.x - c.x;
      let k = b.y - c.y,
        l = d.y - c.y;
      c = h * l - g * k;
      g = (e * l - g * f) / c;
      e = (h * f - e * k) / c;
      return {
        a11: b.x - a.x + g * b.x,
        a12: b.y - a.y + g * b.y,
        a13: g,
        a21: d.x - a.x + e * d.x,
        a22: d.y - a.y + e * d.y,
        a23: e,
        a31: a.x,
        a32: a.y,
        a33: 1,
      };
    }
  }
  function fa(a, b, c, d) {
    a = M(a, b, c, d);
    return {
      a11: a.a22 * a.a33 - a.a23 * a.a32,
      a12: a.a13 * a.a32 - a.a12 * a.a33,
      a13: a.a12 * a.a23 - a.a13 * a.a22,
      a21: a.a23 * a.a31 - a.a21 * a.a33,
      a22: a.a11 * a.a33 - a.a13 * a.a31,
      a23: a.a13 * a.a21 - a.a11 * a.a23,
      a31: a.a21 * a.a32 - a.a22 * a.a31,
      a32: a.a12 * a.a31 - a.a11 * a.a32,
      a33: a.a11 * a.a22 - a.a12 * a.a21,
    };
  }
  function ha(a, b) {
    var c = fa(
        { x: 3.5, y: 3.5 },
        { x: b.dimension - 3.5, y: 3.5 },
        { x: b.dimension - 6.5, y: b.dimension - 6.5 },
        { x: 3.5, y: b.dimension - 3.5 }
      ),
      d = M(b.topLeft, b.topRight, b.alignmentPattern, b.bottomLeft),
      e = d.a11 * c.a11 + d.a21 * c.a12 + d.a31 * c.a13,
      f = d.a12 * c.a11 + d.a22 * c.a12 + d.a32 * c.a13,
      g = d.a13 * c.a11 + d.a23 * c.a12 + d.a33 * c.a13,
      h = d.a11 * c.a21 + d.a21 * c.a22 + d.a31 * c.a23,
      k = d.a12 * c.a21 + d.a22 * c.a22 + d.a32 * c.a23,
      l = d.a13 * c.a21 + d.a23 * c.a22 + d.a33 * c.a23,
      q = d.a11 * c.a31 + d.a21 * c.a32 + d.a31 * c.a33,
      p = d.a12 * c.a31 + d.a22 * c.a32 + d.a32 * c.a33,
      m = d.a13 * c.a31 + d.a23 * c.a32 + d.a33 * c.a33;
    c = A.createEmpty(b.dimension, b.dimension);
    d = (a, b) => {
      const c = g * a + l * b + m;
      return { x: (e * a + h * b + q) / c, y: (f * a + k * b + p) / c };
    };
    for (let e = 0; e < b.dimension; e++)
      for (let f = 0; f < b.dimension; f++) {
        let b = d(f + 0.5, e + 0.5);
        c.set(f, e, a.get(Math.floor(b.x), Math.floor(b.y)));
      }
    return { matrix: c, mappingFunction: d };
  }
  function u(a) {
    return a.reduce((a, c) => a + c);
  }
  function ia(a, b, c) {
    let d = x(a, b),
      e = x(b, c),
      f = x(a, c),
      g,
      h,
      k;
    e >= d && e >= f
      ? ([g, h, k] = [b, a, c])
      : f >= e && f >= d
      ? ([g, h, k] = [a, b, c])
      : ([g, h, k] = [a, c, b]);
    0 > (k.x - h.x) * (g.y - h.y) - (k.y - h.y) * (g.x - h.x) &&
      ([g, k] = [k, g]);
    return { bottomLeft: g, topLeft: h, topRight: k };
  }
  function ja(a, b, c, d) {
    d =
      (u(z(a, c, d, 5)) / 7 +
        u(z(a, b, d, 5)) / 7 +
        u(z(c, a, d, 5)) / 7 +
        u(z(b, a, d, 5)) / 7) /
      4;
    if (1 > d) throw Error('Invalid module size');
    b = Math.round(x(a, b) / d);
    a = Math.round(x(a, c) / d);
    a = Math.floor((b + a) / 2) + 7;
    switch (a % 4) {
      case 0:
        a++;
        break;
      case 2:
        a--;
    }
    return { dimension: a, moduleSize: d };
  }
  function N(a, b, c, d) {
    let e = [{ x: Math.floor(a.x), y: Math.floor(a.y) }];
    var f = Math.abs(b.y - a.y) > Math.abs(b.x - a.x);
    if (f) {
      var g = Math.floor(a.y);
      var h = Math.floor(a.x);
      a = Math.floor(b.y);
      b = Math.floor(b.x);
    } else
      (g = Math.floor(a.x)),
        (h = Math.floor(a.y)),
        (a = Math.floor(b.x)),
        (b = Math.floor(b.y));
    let k = Math.abs(a - g),
      l = Math.abs(b - h),
      q = Math.floor(-k / 2),
      p = g < a ? 1 : -1,
      m = h < b ? 1 : -1,
      r = !0;
    for (let n = g, v = h; n !== a + p; n += p) {
      g = f ? v : n;
      h = f ? n : v;
      if (
        c.get(g, h) !== r &&
        ((r = !r), e.push({ x: g, y: h }), e.length === d + 1)
      )
        break;
      q += l;
      if (0 < q) {
        if (v === b) break;
        v += m;
        q -= k;
      }
    }
    c = [];
    for (f = 0; f < d; f++)
      e[f] && e[f + 1] ? c.push(x(e[f], e[f + 1])) : c.push(0);
    return c;
  }
  function z(a, b, c, d) {
    let e = b.y - a.y,
      f = b.x - a.x;
    b = N(a, b, c, Math.ceil(d / 2));
    a = N(a, { x: a.x - f, y: a.y - e }, c, Math.ceil(d / 2));
    c = b.shift() + a.shift() - 1;
    return a.concat(c).concat(...b);
  }
  function F(a, b) {
    let c = u(a) / u(b),
      d = 0;
    b.forEach((b, f) => {
      d += Math.pow(a[f] - b * c, 2);
    });
    return { averageSize: c, error: d };
  }
  function O(a, b, c) {
    try {
      let d = z(a, { x: -1, y: a.y }, c, b.length),
        e = z(a, { x: a.x, y: -1 }, c, b.length),
        f = z(
          a,
          { x: Math.max(0, a.x - a.y) - 1, y: Math.max(0, a.y - a.x) - 1 },
          c,
          b.length
        ),
        g = z(
          a,
          {
            x: Math.min(c.width, a.x + a.y) + 1,
            y: Math.min(c.height, a.y + a.x) + 1,
          },
          c,
          b.length
        ),
        h = F(d, b),
        k = F(e, b),
        l = F(f, b),
        q = F(g, b),
        p = (h.averageSize + k.averageSize + l.averageSize + q.averageSize) / 4;
      return (
        Math.sqrt(
          h.error * h.error +
            k.error * k.error +
            l.error * l.error +
            q.error * q.error
        ) +
        (Math.pow(h.averageSize - p, 2) +
          Math.pow(k.averageSize - p, 2) +
          Math.pow(l.averageSize - p, 2) +
          Math.pow(q.averageSize - p, 2)) /
          p
      );
    } catch (d) {
      return Infinity;
    }
  }
  function H(a, b) {
    for (var c = Math.round(b.x); a.get(c, Math.round(b.y)); ) c--;
    for (var d = Math.round(b.x); a.get(d, Math.round(b.y)); ) d++;
    c = (c + d) / 2;
    for (d = Math.round(b.y); a.get(Math.round(c), d); ) d--;
    for (b = Math.round(b.y); a.get(Math.round(c), b); ) b++;
    return { x: c, y: (d + b) / 2 };
  }
  function ka(a) {
    var b = [],
      c = [],
      d = [],
      e = [];
    for (let m = 0; m <= a.height; m++) {
      var f = 0;
      let l = !1,
        n = [0, 0, 0, 0, 0];
      for (let b = -1; b <= a.width; b++) {
        var g = a.get(b, m);
        if (g === l) f++;
        else {
          n = [n[1], n[2], n[3], n[4], f];
          f = 1;
          l = g;
          var h = u(n) / 7;
          h =
            Math.abs(n[0] - h) < h &&
            Math.abs(n[1] - h) < h &&
            Math.abs(n[2] - 3 * h) < 3 * h &&
            Math.abs(n[3] - h) < h &&
            Math.abs(n[4] - h) < h &&
            !g;
          var k = u(n.slice(-3)) / 3;
          g =
            Math.abs(n[2] - k) < k &&
            Math.abs(n[3] - k) < k &&
            Math.abs(n[4] - k) < k &&
            g;
          if (h) {
            let a = b - n[3] - n[4],
              d = a - n[2];
            h = { startX: d, endX: a, y: m };
            k = c.filter(
              (b) =>
                (d >= b.bottom.startX && d <= b.bottom.endX) ||
                (a >= b.bottom.startX && d <= b.bottom.endX) ||
                (d <= b.bottom.startX &&
                  a >= b.bottom.endX &&
                  1.5 > n[2] / (b.bottom.endX - b.bottom.startX) &&
                  0.5 < n[2] / (b.bottom.endX - b.bottom.startX))
            );
            0 < k.length ? (k[0].bottom = h) : c.push({ top: h, bottom: h });
          }
          if (g) {
            let a = b - n[4],
              c = a - n[3];
            g = { startX: c, y: m, endX: a };
            h = e.filter(
              (b) =>
                (c >= b.bottom.startX && c <= b.bottom.endX) ||
                (a >= b.bottom.startX && c <= b.bottom.endX) ||
                (c <= b.bottom.startX &&
                  a >= b.bottom.endX &&
                  1.5 > n[2] / (b.bottom.endX - b.bottom.startX) &&
                  0.5 < n[2] / (b.bottom.endX - b.bottom.startX))
            );
            0 < h.length ? (h[0].bottom = g) : e.push({ top: g, bottom: g });
          }
        }
      }
      b.push(...c.filter((a) => a.bottom.y !== m && 2 <= a.bottom.y - a.top.y));
      c = c.filter((a) => a.bottom.y === m);
      d.push(...e.filter((a) => a.bottom.y !== m));
      e = e.filter((a) => a.bottom.y === m);
    }
    b.push(...c.filter((a) => 2 <= a.bottom.y - a.top.y));
    d.push(...e);
    b = b
      .filter((a) => 2 <= a.bottom.y - a.top.y)
      .map((b) => {
        const c =
            (b.top.startX + b.top.endX + b.bottom.startX + b.bottom.endX) / 4,
          d = (b.top.y + b.bottom.y + 1) / 2;
        if (a.get(Math.round(c), Math.round(d)))
          return (
            (b = [
              b.top.endX - b.top.startX,
              b.bottom.endX - b.bottom.startX,
              b.bottom.y - b.top.y + 1,
            ]),
            (b = u(b) / b.length),
            {
              score: O(
                { x: Math.round(c), y: Math.round(d) },
                [1, 1, 3, 1, 1],
                a
              ),
              x: c,
              y: d,
              size: b,
            }
          );
      })
      .filter((a) => !!a)
      .sort((a, b) => a.score - b.score)
      .map((a, b, c) => {
        if (4 < b) return null;
        c = c
          .filter((a, c) => b !== c)
          .map((b) => ({
            x: b.x,
            y: b.y,
            score: b.score + Math.pow(b.size - a.size, 2) / a.size,
            size: b.size,
          }))
          .sort((a, b) => a.score - b.score);
        if (2 > c.length) return null;
        const d = a.score + c[0].score + c[1].score;
        return { points: [a].concat(c.slice(0, 2)), score: d };
      })
      .filter((a) => !!a)
      .sort((a, b) => a.score - b.score);
    if (0 === b.length) return null;
    let {
      topRight: l,
      topLeft: q,
      bottomLeft: p,
    } = ia(b[0].points[0], b[0].points[1], b[0].points[2]);
    c = P(a, d, l, q, p);
    b = [];
    c &&
      b.push({
        alignmentPattern: { x: c.alignmentPattern.x, y: c.alignmentPattern.y },
        bottomLeft: { x: p.x, y: p.y },
        dimension: c.dimension,
        topLeft: { x: q.x, y: q.y },
        topRight: { x: l.x, y: l.y },
      });
    c = H(a, l);
    e = H(a, q);
    f = H(a, p);
    (d = P(a, d, c, e, f)) &&
      b.push({
        alignmentPattern: { x: d.alignmentPattern.x, y: d.alignmentPattern.y },
        bottomLeft: { x: f.x, y: f.y },
        topLeft: { x: e.x, y: e.y },
        topRight: { x: c.x, y: c.y },
        dimension: d.dimension,
      });
    return 0 === b.length ? null : b;
  }
  function P(a, b, c, d, e) {
    let f, g;
    try {
      ({ dimension: f, moduleSize: g } = ja(d, c, e, a));
    } catch (q) {
      return null;
    }
    var h = c.x - d.x + e.x,
      k = c.y - d.y + e.y;
    c = (x(d, e) + x(d, c)) / 2 / g;
    e = 1 - 3 / c;
    let l = { x: d.x + e * (h - d.x), y: d.y + e * (k - d.y) };
    b = b
      .map((b) => {
        const c =
            (b.top.startX + b.top.endX + b.bottom.startX + b.bottom.endX) / 4,
          d = (b.top.y + b.bottom.y + 1) / 2;
        if (a.get(Math.floor(c), Math.floor(d)))
          return (
            u([
              b.top.endX - b.top.startX,
              b.bottom.endX - b.bottom.startX,
              b.bottom.y - b.top.y + 1,
            ]),
            (b =
              O({ x: Math.floor(c), y: Math.floor(d) }, [1, 1, 1], a) +
              x({ x: c, y: d }, l)),
            { x: c, y: d, score: b }
          );
      })
      .filter((a) => !!a)
      .sort((a, b) => a.score - b.score);
    return { alignmentPattern: 15 <= c && b.length ? b[0] : l, dimension: f };
  }
  function Q(a) {
    var b = ka(a);
    if (!b) return null;
    for (let e of b) {
      b = ha(a, e);
      var c = b.matrix;
      if (null == c) c = null;
      else {
        var d = L(c);
        if (d) c = d;
        else {
          for (d = 0; d < c.width; d++)
            for (let a = d + 1; a < c.height; a++)
              c.get(d, a) !== c.get(a, d) &&
                (c.set(d, a, !c.get(d, a)), c.set(a, d, !c.get(a, d)));
          c = L(c);
        }
      }
      if (c)
        return {
          binaryData: c.bytes,
          data: c.text,
          chunks: c.chunks,
          location: {
            topRightCorner: b.mappingFunction(e.dimension, 0),
            topLeftCorner: b.mappingFunction(0, 0),
            bottomRightCorner: b.mappingFunction(e.dimension, e.dimension),
            bottomLeftCorner: b.mappingFunction(0, e.dimension),
            topRightFinderPattern: e.topRight,
            topLeftFinderPattern: e.topLeft,
            bottomLeftFinderPattern: e.bottomLeft,
            bottomRightAlignmentPattern: e.alignmentPattern,
          },
          matrix: b.matrix,
        };
    }
    return null;
  }
  function R(a, b) {
    Object.keys(b).forEach((c) => {
      a[c] = b[c];
    });
  }
  function I(a, b, c, d = {}) {
    let e = Object.create(null);
    R(e, la);
    R(e, d);
    d =
      'onlyInvert' === e.inversionAttempts ||
      'invertFirst' === e.inversionAttempts;
    var f = 'attemptBoth' === e.inversionAttempts || d;
    var g = e.greyScaleWeights,
      h = e.canOverwriteImage,
      k = b * c;
    if (a.length !== 4 * k) throw Error('Malformed data passed to binarizer.');
    var l = 0;
    if (h) {
      var q = new Uint8ClampedArray(a.buffer, l, k);
      l += k;
    }
    q = new S(b, c, q);
    if (g.useIntegerApproximation)
      for (var p = 0; p < c; p++)
        for (var m = 0; m < b; m++) {
          var r = 4 * (p * b + m);
          q.set(
            m,
            p,
            (g.red * a[r] + g.green * a[r + 1] + g.blue * a[r + 2] + 128) >> 8
          );
        }
    else
      for (p = 0; p < c; p++)
        for (m = 0; m < b; m++)
          (r = 4 * (p * b + m)),
            q.set(m, p, g.red * a[r] + g.green * a[r + 1] + g.blue * a[r + 2]);
    g = Math.ceil(b / 8);
    p = Math.ceil(c / 8);
    m = g * p;
    if (h) {
      var n = new Uint8ClampedArray(a.buffer, l, m);
      l += m;
    }
    n = new S(g, p, n);
    for (m = 0; m < p; m++)
      for (r = 0; r < g; r++) {
        var v = Infinity,
          t = 0;
        for (var u = 0; 8 > u; u++)
          for (let a = 0; 8 > a; a++) {
            let b = q.get(8 * r + a, 8 * m + u);
            v = Math.min(v, b);
            t = Math.max(t, b);
          }
        u = (v + t) / 2;
        u = Math.min(255, 1.1 * u);
        24 >= t - v &&
          ((u = v / 2),
          0 < m &&
            0 < r &&
            ((t =
              (n.get(r, m - 1) + 2 * n.get(r - 1, m) + n.get(r - 1, m - 1)) /
              4),
            v < t && (u = t)));
        n.set(r, m, u);
      }
    h
      ? ((m = new Uint8ClampedArray(a.buffer, l, k)),
        (l += k),
        (m = new A(m, b)))
      : (m = A.createEmpty(b, c));
    r = null;
    f &&
      (h
        ? ((a = new Uint8ClampedArray(a.buffer, l, k)), (r = new A(a, b)))
        : (r = A.createEmpty(b, c)));
    for (b = 0; b < p; b++)
      for (a = 0; a < g; a++) {
        c = g - 3;
        c = 2 > a ? 2 : a > c ? c : a;
        h = p - 3;
        h = 2 > b ? 2 : b > h ? h : b;
        k = 0;
        for (l = -2; 2 >= l; l++)
          for (v = -2; 2 >= v; v++) k += n.get(c + l, h + v);
        c = k / 25;
        for (h = 0; 8 > h; h++)
          for (k = 0; 8 > k; k++)
            (l = 8 * a + h),
              (v = 8 * b + k),
              (t = q.get(l, v)),
              m.set(l, v, t <= c),
              f && r.set(l, v, !(t <= c));
      }
    f = f ? { binarized: m, inverted: r } : { binarized: m };
    let { binarized: w, inverted: x } = f;
    (f = Q(d ? x : w)) ||
      ('attemptBoth' !== e.inversionAttempts &&
        'invertFirst' !== e.inversionAttempts) ||
      (f = Q(d ? w : x));
    return f;
  }
  class A {
    constructor(a, b) {
      this.width = b;
      this.height = a.length / b;
      this.data = a;
    }
    static createEmpty(a, b) {
      return new A(new Uint8ClampedArray(a * b), a);
    }
    get(a, b) {
      return 0 > a || a >= this.width || 0 > b || b >= this.height
        ? !1
        : !!this.data[b * this.width + a];
    }
    set(a, b, c) {
      this.data[b * this.width + a] = c ? 1 : 0;
    }
    setRegion(a, b, c, d, e) {
      for (let f = b; f < b + d; f++)
        for (let b = a; b < a + c; b++) this.set(b, f, !!e);
    }
  }
  class S {
    constructor(a, b, c) {
      this.width = a;
      a *= b;
      if (c && c.length !== a) throw Error('Wrong buffer size');
      this.data = c || new Uint8ClampedArray(a);
    }
    get(a, b) {
      return this.data[b * this.width + a];
    }
    set(a, b, c) {
      this.data[b * this.width + a] = c;
    }
  }
  class V {
    constructor(a) {
      this.bitOffset = this.byteOffset = 0;
      this.bytes = a;
    }
    readBits(a) {
      if (1 > a || 32 < a || a > this.available())
        throw Error('Cannot read ' + a.toString() + ' bits');
      var b = 0;
      if (0 < this.bitOffset) {
        b = 8 - this.bitOffset;
        var c = a < b ? a : b;
        b -= c;
        b = (this.bytes[this.byteOffset] & ((255 >> (8 - c)) << b)) >> b;
        a -= c;
        this.bitOffset += c;
        8 === this.bitOffset && ((this.bitOffset = 0), this.byteOffset++);
      }
      if (0 < a) {
        for (; 8 <= a; )
          (b = (b << 8) | (this.bytes[this.byteOffset] & 255)),
            this.byteOffset++,
            (a -= 8);
        0 < a &&
          ((c = 8 - a),
          (b =
            (b << a) |
            ((this.bytes[this.byteOffset] & ((255 >> c) << c)) >> c)),
          (this.bitOffset += a));
      }
      return b;
    }
    available() {
      return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
    }
  }
  var t;
  (function (a) {
    a.Numeric = 'numeric';
    a.Alphanumeric = 'alphanumeric';
    a.Byte = 'byte';
    a.Kanji = 'kanji';
    a.ECI = 'eci';
  })(t || (t = {}));
  var y;
  (function (a) {
    a[(a.Terminator = 0)] = 'Terminator';
    a[(a.Numeric = 1)] = 'Numeric';
    a[(a.Alphanumeric = 2)] = 'Alphanumeric';
    a[(a.Byte = 4)] = 'Byte';
    a[(a.Kanji = 8)] = 'Kanji';
    a[(a.ECI = 7)] = 'ECI';
  })(y || (y = {}));
  let B = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.split('');
  class w {
    constructor(a, b) {
      if (0 === b.length) throw Error('No coefficients.');
      this.field = a;
      let c = b.length;
      if (1 < c && 0 === b[0]) {
        let d = 1;
        for (; d < c && 0 === b[d]; ) d++;
        if (d === c) this.coefficients = a.zero.coefficients;
        else
          for (
            this.coefficients = new Uint8ClampedArray(c - d), a = 0;
            a < this.coefficients.length;
            a++
          )
            this.coefficients[a] = b[d + a];
      } else this.coefficients = b;
    }
    degree() {
      return this.coefficients.length - 1;
    }
    isZero() {
      return 0 === this.coefficients[0];
    }
    getCoefficient(a) {
      return this.coefficients[this.coefficients.length - 1 - a];
    }
    addOrSubtract(a) {
      if (this.isZero()) return a;
      if (a.isZero()) return this;
      let b = this.coefficients;
      a = a.coefficients;
      b.length > a.length && ([b, a] = [a, b]);
      let c = new Uint8ClampedArray(a.length),
        d = a.length - b.length;
      for (var e = 0; e < d; e++) c[e] = a[e];
      for (e = d; e < a.length; e++) c[e] = b[e - d] ^ a[e];
      return new w(this.field, c);
    }
    multiply(a) {
      if (0 === a) return this.field.zero;
      if (1 === a) return this;
      let b = this.coefficients.length,
        c = new Uint8ClampedArray(b);
      for (let d = 0; d < b; d++)
        c[d] = this.field.multiply(this.coefficients[d], a);
      return new w(this.field, c);
    }
    multiplyPoly(a) {
      if (this.isZero() || a.isZero()) return this.field.zero;
      let b = this.coefficients,
        c = b.length;
      a = a.coefficients;
      let d = a.length,
        e = new Uint8ClampedArray(c + d - 1);
      for (let h = 0; h < c; h++) {
        let c = b[h];
        for (let b = 0; b < d; b++) {
          var f = h + b,
            g = this.field.multiply(c, a[b]);
          e[f] = e[h + b] ^ g;
        }
      }
      return new w(this.field, e);
    }
    multiplyByMonomial(a, b) {
      if (0 > a) throw Error('Invalid degree less than 0');
      if (0 === b) return this.field.zero;
      let c = this.coefficients.length;
      a = new Uint8ClampedArray(c + a);
      for (let d = 0; d < c; d++)
        a[d] = this.field.multiply(this.coefficients[d], b);
      return new w(this.field, a);
    }
    evaluateAt(a) {
      let b = 0;
      if (0 === a) return this.getCoefficient(0);
      let c = this.coefficients.length;
      if (1 === a)
        return (
          this.coefficients.forEach((a) => {
            b ^= a;
          }),
          b
        );
      b = this.coefficients[0];
      for (let d = 1; d < c; d++)
        b = J(this.field.multiply(a, b), this.coefficients[d]);
      return b;
    }
  }
  class Y {
    constructor(a, b, c) {
      this.primitive = a;
      this.size = b;
      this.generatorBase = c;
      this.expTable = Array(this.size);
      this.logTable = Array(this.size);
      a = 1;
      for (b = 0; b < this.size; b++)
        (this.expTable[b] = a),
          (a *= 2),
          a >= this.size && (a = (a ^ this.primitive) & (this.size - 1));
      for (a = 0; a < this.size - 1; a++) this.logTable[this.expTable[a]] = a;
      this.zero = new w(this, Uint8ClampedArray.from([0]));
      this.one = new w(this, Uint8ClampedArray.from([1]));
    }
    multiply(a, b) {
      return 0 === a || 0 === b
        ? 0
        : this.expTable[
            (this.logTable[a] + this.logTable[b]) % (this.size - 1)
          ];
    }
    inverse(a) {
      if (0 === a) throw Error("Can't invert 0");
      return this.expTable[this.size - this.logTable[a] - 1];
    }
    buildMonomial(a, b) {
      if (0 > a) throw Error('Invalid monomial degree less than 0');
      if (0 === b) return this.zero;
      a = new Uint8ClampedArray(a + 1);
      a[0] = b;
      return new w(this, a);
    }
    log(a) {
      if (0 === a) throw Error("Can't take log(0)");
      return this.logTable[a];
    }
    exp(a) {
      return this.expTable[a];
    }
  }
  let K = [
      {
        infoBits: null,
        versionNumber: 1,
        alignmentPatternCenters: [],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 7,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 19 }],
          },
          {
            ecCodewordsPerBlock: 10,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }],
          },
          {
            ecCodewordsPerBlock: 13,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 13 }],
          },
          {
            ecCodewordsPerBlock: 17,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 9 }],
          },
        ],
      },
      {
        infoBits: null,
        versionNumber: 2,
        alignmentPatternCenters: [6, 18],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 10,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 34 }],
          },
          {
            ecCodewordsPerBlock: 16,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 28 }],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 22 }],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }],
          },
        ],
      },
      {
        infoBits: null,
        versionNumber: 3,
        alignmentPatternCenters: [6, 22],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 15,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 55 }],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 44 }],
          },
          {
            ecCodewordsPerBlock: 18,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 17 }],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 13 }],
          },
        ],
      },
      {
        infoBits: null,
        versionNumber: 4,
        alignmentPatternCenters: [6, 26],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 20,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 80 }],
          },
          {
            ecCodewordsPerBlock: 18,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 32 }],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 24 }],
          },
          {
            ecCodewordsPerBlock: 16,
            ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 9 }],
          },
        ],
      },
      {
        infoBits: null,
        versionNumber: 5,
        alignmentPatternCenters: [6, 30],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 108 }],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 43 }],
          },
          {
            ecCodewordsPerBlock: 18,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 15 },
              { numBlocks: 2, dataCodewordsPerBlock: 16 },
            ],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 11 },
              { numBlocks: 2, dataCodewordsPerBlock: 12 },
            ],
          },
        ],
      },
      {
        infoBits: null,
        versionNumber: 6,
        alignmentPatternCenters: [6, 34],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 18,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 68 }],
          },
          {
            ecCodewordsPerBlock: 16,
            ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 27 }],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 19 }],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 15 }],
          },
        ],
      },
      {
        infoBits: 31892,
        versionNumber: 7,
        alignmentPatternCenters: [6, 22, 38],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 20,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 78 }],
          },
          {
            ecCodewordsPerBlock: 18,
            ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 31 }],
          },
          {
            ecCodewordsPerBlock: 18,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 14 },
              { numBlocks: 4, dataCodewordsPerBlock: 15 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 13 },
              { numBlocks: 1, dataCodewordsPerBlock: 14 },
            ],
          },
        ],
      },
      {
        infoBits: 34236,
        versionNumber: 8,
        alignmentPatternCenters: [6, 24, 42],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 97 }],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 38 },
              { numBlocks: 2, dataCodewordsPerBlock: 39 },
            ],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 18 },
              { numBlocks: 2, dataCodewordsPerBlock: 19 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 14 },
              { numBlocks: 2, dataCodewordsPerBlock: 15 },
            ],
          },
        ],
      },
      {
        infoBits: 39577,
        versionNumber: 9,
        alignmentPatternCenters: [6, 26, 46],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 116 }],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 36 },
              { numBlocks: 2, dataCodewordsPerBlock: 37 },
            ],
          },
          {
            ecCodewordsPerBlock: 20,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 16 },
              { numBlocks: 4, dataCodewordsPerBlock: 17 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 12 },
              { numBlocks: 4, dataCodewordsPerBlock: 13 },
            ],
          },
        ],
      },
      {
        infoBits: 42195,
        versionNumber: 10,
        alignmentPatternCenters: [6, 28, 50],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 18,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 68 },
              { numBlocks: 2, dataCodewordsPerBlock: 69 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 43 },
              { numBlocks: 1, dataCodewordsPerBlock: 44 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 6, dataCodewordsPerBlock: 19 },
              { numBlocks: 2, dataCodewordsPerBlock: 20 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 6, dataCodewordsPerBlock: 15 },
              { numBlocks: 2, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 48118,
        versionNumber: 11,
        alignmentPatternCenters: [6, 30, 54],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 20,
            ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 81 }],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 1, dataCodewordsPerBlock: 50 },
              { numBlocks: 4, dataCodewordsPerBlock: 51 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 22 },
              { numBlocks: 4, dataCodewordsPerBlock: 23 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 12 },
              { numBlocks: 8, dataCodewordsPerBlock: 13 },
            ],
          },
        ],
      },
      {
        infoBits: 51042,
        versionNumber: 12,
        alignmentPatternCenters: [6, 32, 58],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 92 },
              { numBlocks: 2, dataCodewordsPerBlock: 93 },
            ],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [
              { numBlocks: 6, dataCodewordsPerBlock: 36 },
              { numBlocks: 2, dataCodewordsPerBlock: 37 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 20 },
              { numBlocks: 6, dataCodewordsPerBlock: 21 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 7, dataCodewordsPerBlock: 14 },
              { numBlocks: 4, dataCodewordsPerBlock: 15 },
            ],
          },
        ],
      },
      {
        infoBits: 55367,
        versionNumber: 13,
        alignmentPatternCenters: [6, 34, 62],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 107 }],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [
              { numBlocks: 8, dataCodewordsPerBlock: 37 },
              { numBlocks: 1, dataCodewordsPerBlock: 38 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 8, dataCodewordsPerBlock: 20 },
              { numBlocks: 4, dataCodewordsPerBlock: 21 },
            ],
          },
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [
              { numBlocks: 12, dataCodewordsPerBlock: 11 },
              { numBlocks: 4, dataCodewordsPerBlock: 12 },
            ],
          },
        ],
      },
      {
        infoBits: 58893,
        versionNumber: 14,
        alignmentPatternCenters: [6, 26, 46, 66],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 115 },
              { numBlocks: 1, dataCodewordsPerBlock: 116 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 40 },
              { numBlocks: 5, dataCodewordsPerBlock: 41 },
            ],
          },
          {
            ecCodewordsPerBlock: 20,
            ecBlocks: [
              { numBlocks: 11, dataCodewordsPerBlock: 16 },
              { numBlocks: 5, dataCodewordsPerBlock: 17 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 11, dataCodewordsPerBlock: 12 },
              { numBlocks: 5, dataCodewordsPerBlock: 13 },
            ],
          },
        ],
      },
      {
        infoBits: 63784,
        versionNumber: 15,
        alignmentPatternCenters: [6, 26, 48, 70],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 22,
            ecBlocks: [
              { numBlocks: 5, dataCodewordsPerBlock: 87 },
              { numBlocks: 1, dataCodewordsPerBlock: 88 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 5, dataCodewordsPerBlock: 41 },
              { numBlocks: 5, dataCodewordsPerBlock: 42 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 5, dataCodewordsPerBlock: 24 },
              { numBlocks: 7, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 11, dataCodewordsPerBlock: 12 },
              { numBlocks: 7, dataCodewordsPerBlock: 13 },
            ],
          },
        ],
      },
      {
        infoBits: 68472,
        versionNumber: 16,
        alignmentPatternCenters: [6, 26, 50, 74],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 5, dataCodewordsPerBlock: 98 },
              { numBlocks: 1, dataCodewordsPerBlock: 99 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 7, dataCodewordsPerBlock: 45 },
              { numBlocks: 3, dataCodewordsPerBlock: 46 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [
              { numBlocks: 15, dataCodewordsPerBlock: 19 },
              { numBlocks: 2, dataCodewordsPerBlock: 20 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 15 },
              { numBlocks: 13, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 70749,
        versionNumber: 17,
        alignmentPatternCenters: [6, 30, 54, 78],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 1, dataCodewordsPerBlock: 107 },
              { numBlocks: 5, dataCodewordsPerBlock: 108 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 10, dataCodewordsPerBlock: 46 },
              { numBlocks: 1, dataCodewordsPerBlock: 47 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 1, dataCodewordsPerBlock: 22 },
              { numBlocks: 15, dataCodewordsPerBlock: 23 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 14 },
              { numBlocks: 17, dataCodewordsPerBlock: 15 },
            ],
          },
        ],
      },
      {
        infoBits: 76311,
        versionNumber: 18,
        alignmentPatternCenters: [6, 30, 56, 82],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 5, dataCodewordsPerBlock: 120 },
              { numBlocks: 1, dataCodewordsPerBlock: 121 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 9, dataCodewordsPerBlock: 43 },
              { numBlocks: 4, dataCodewordsPerBlock: 44 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 17, dataCodewordsPerBlock: 22 },
              { numBlocks: 1, dataCodewordsPerBlock: 23 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 14 },
              { numBlocks: 19, dataCodewordsPerBlock: 15 },
            ],
          },
        ],
      },
      {
        infoBits: 79154,
        versionNumber: 19,
        alignmentPatternCenters: [6, 30, 58, 86],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 113 },
              { numBlocks: 4, dataCodewordsPerBlock: 114 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 44 },
              { numBlocks: 11, dataCodewordsPerBlock: 45 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 17, dataCodewordsPerBlock: 21 },
              { numBlocks: 4, dataCodewordsPerBlock: 22 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 9, dataCodewordsPerBlock: 13 },
              { numBlocks: 16, dataCodewordsPerBlock: 14 },
            ],
          },
        ],
      },
      {
        infoBits: 84390,
        versionNumber: 20,
        alignmentPatternCenters: [6, 34, 62, 90],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 107 },
              { numBlocks: 5, dataCodewordsPerBlock: 108 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 41 },
              { numBlocks: 13, dataCodewordsPerBlock: 42 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 15, dataCodewordsPerBlock: 24 },
              { numBlocks: 5, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 15, dataCodewordsPerBlock: 15 },
              { numBlocks: 10, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 87683,
        versionNumber: 21,
        alignmentPatternCenters: [6, 28, 50, 72, 94],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 116 },
              { numBlocks: 4, dataCodewordsPerBlock: 117 },
            ],
          },
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 42 }],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 17, dataCodewordsPerBlock: 22 },
              { numBlocks: 6, dataCodewordsPerBlock: 23 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 19, dataCodewordsPerBlock: 16 },
              { numBlocks: 6, dataCodewordsPerBlock: 17 },
            ],
          },
        ],
      },
      {
        infoBits: 92361,
        versionNumber: 22,
        alignmentPatternCenters: [6, 26, 50, 74, 98],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 111 },
              { numBlocks: 7, dataCodewordsPerBlock: 112 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 46 }],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 7, dataCodewordsPerBlock: 24 },
              { numBlocks: 16, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 24,
            ecBlocks: [{ numBlocks: 34, dataCodewordsPerBlock: 13 }],
          },
        ],
      },
      {
        infoBits: 96236,
        versionNumber: 23,
        alignmentPatternCenters: [6, 30, 54, 74, 102],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 121 },
              { numBlocks: 5, dataCodewordsPerBlock: 122 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 47 },
              { numBlocks: 14, dataCodewordsPerBlock: 48 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 11, dataCodewordsPerBlock: 24 },
              { numBlocks: 14, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 16, dataCodewordsPerBlock: 15 },
              { numBlocks: 14, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 102084,
        versionNumber: 24,
        alignmentPatternCenters: [6, 28, 54, 80, 106],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 6, dataCodewordsPerBlock: 117 },
              { numBlocks: 4, dataCodewordsPerBlock: 118 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 6, dataCodewordsPerBlock: 45 },
              { numBlocks: 14, dataCodewordsPerBlock: 46 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 11, dataCodewordsPerBlock: 24 },
              { numBlocks: 16, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 30, dataCodewordsPerBlock: 16 },
              { numBlocks: 2, dataCodewordsPerBlock: 17 },
            ],
          },
        ],
      },
      {
        infoBits: 102881,
        versionNumber: 25,
        alignmentPatternCenters: [6, 32, 58, 84, 110],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 26,
            ecBlocks: [
              { numBlocks: 8, dataCodewordsPerBlock: 106 },
              { numBlocks: 4, dataCodewordsPerBlock: 107 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 8, dataCodewordsPerBlock: 47 },
              { numBlocks: 13, dataCodewordsPerBlock: 48 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 7, dataCodewordsPerBlock: 24 },
              { numBlocks: 22, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 22, dataCodewordsPerBlock: 15 },
              { numBlocks: 13, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 110507,
        versionNumber: 26,
        alignmentPatternCenters: [6, 30, 58, 86, 114],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 10, dataCodewordsPerBlock: 114 },
              { numBlocks: 2, dataCodewordsPerBlock: 115 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 19, dataCodewordsPerBlock: 46 },
              { numBlocks: 4, dataCodewordsPerBlock: 47 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 28, dataCodewordsPerBlock: 22 },
              { numBlocks: 6, dataCodewordsPerBlock: 23 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 33, dataCodewordsPerBlock: 16 },
              { numBlocks: 4, dataCodewordsPerBlock: 17 },
            ],
          },
        ],
      },
      {
        infoBits: 110734,
        versionNumber: 27,
        alignmentPatternCenters: [6, 34, 62, 90, 118],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 8, dataCodewordsPerBlock: 122 },
              { numBlocks: 4, dataCodewordsPerBlock: 123 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 22, dataCodewordsPerBlock: 45 },
              { numBlocks: 3, dataCodewordsPerBlock: 46 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 8, dataCodewordsPerBlock: 23 },
              { numBlocks: 26, dataCodewordsPerBlock: 24 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 12, dataCodewordsPerBlock: 15 },
              { numBlocks: 28, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 117786,
        versionNumber: 28,
        alignmentPatternCenters: [6, 26, 50, 74, 98, 122],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 117 },
              { numBlocks: 10, dataCodewordsPerBlock: 118 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 3, dataCodewordsPerBlock: 45 },
              { numBlocks: 23, dataCodewordsPerBlock: 46 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 24 },
              { numBlocks: 31, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 11, dataCodewordsPerBlock: 15 },
              { numBlocks: 31, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 119615,
        versionNumber: 29,
        alignmentPatternCenters: [6, 30, 54, 78, 102, 126],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 7, dataCodewordsPerBlock: 116 },
              { numBlocks: 7, dataCodewordsPerBlock: 117 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 21, dataCodewordsPerBlock: 45 },
              { numBlocks: 7, dataCodewordsPerBlock: 46 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 1, dataCodewordsPerBlock: 23 },
              { numBlocks: 37, dataCodewordsPerBlock: 24 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 19, dataCodewordsPerBlock: 15 },
              { numBlocks: 26, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 126325,
        versionNumber: 30,
        alignmentPatternCenters: [6, 26, 52, 78, 104, 130],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 5, dataCodewordsPerBlock: 115 },
              { numBlocks: 10, dataCodewordsPerBlock: 116 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 19, dataCodewordsPerBlock: 47 },
              { numBlocks: 10, dataCodewordsPerBlock: 48 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 15, dataCodewordsPerBlock: 24 },
              { numBlocks: 25, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 23, dataCodewordsPerBlock: 15 },
              { numBlocks: 25, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 127568,
        versionNumber: 31,
        alignmentPatternCenters: [6, 30, 56, 82, 108, 134],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 13, dataCodewordsPerBlock: 115 },
              { numBlocks: 3, dataCodewordsPerBlock: 116 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 46 },
              { numBlocks: 29, dataCodewordsPerBlock: 47 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 42, dataCodewordsPerBlock: 24 },
              { numBlocks: 1, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 23, dataCodewordsPerBlock: 15 },
              { numBlocks: 28, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 133589,
        versionNumber: 32,
        alignmentPatternCenters: [6, 34, 60, 86, 112, 138],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 115 }],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 10, dataCodewordsPerBlock: 46 },
              { numBlocks: 23, dataCodewordsPerBlock: 47 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 10, dataCodewordsPerBlock: 24 },
              { numBlocks: 35, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 19, dataCodewordsPerBlock: 15 },
              { numBlocks: 35, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 136944,
        versionNumber: 33,
        alignmentPatternCenters: [6, 30, 58, 86, 114, 142],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 17, dataCodewordsPerBlock: 115 },
              { numBlocks: 1, dataCodewordsPerBlock: 116 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 14, dataCodewordsPerBlock: 46 },
              { numBlocks: 21, dataCodewordsPerBlock: 47 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 29, dataCodewordsPerBlock: 24 },
              { numBlocks: 19, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 11, dataCodewordsPerBlock: 15 },
              { numBlocks: 46, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 141498,
        versionNumber: 34,
        alignmentPatternCenters: [6, 34, 62, 90, 118, 146],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 13, dataCodewordsPerBlock: 115 },
              { numBlocks: 6, dataCodewordsPerBlock: 116 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 14, dataCodewordsPerBlock: 46 },
              { numBlocks: 23, dataCodewordsPerBlock: 47 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 44, dataCodewordsPerBlock: 24 },
              { numBlocks: 7, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 59, dataCodewordsPerBlock: 16 },
              { numBlocks: 1, dataCodewordsPerBlock: 17 },
            ],
          },
        ],
      },
      {
        infoBits: 145311,
        versionNumber: 35,
        alignmentPatternCenters: [6, 30, 54, 78, 102, 126, 150],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 12, dataCodewordsPerBlock: 121 },
              { numBlocks: 7, dataCodewordsPerBlock: 122 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 12, dataCodewordsPerBlock: 47 },
              { numBlocks: 26, dataCodewordsPerBlock: 48 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 39, dataCodewordsPerBlock: 24 },
              { numBlocks: 14, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 22, dataCodewordsPerBlock: 15 },
              { numBlocks: 41, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 150283,
        versionNumber: 36,
        alignmentPatternCenters: [6, 24, 50, 76, 102, 128, 154],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 6, dataCodewordsPerBlock: 121 },
              { numBlocks: 14, dataCodewordsPerBlock: 122 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 6, dataCodewordsPerBlock: 47 },
              { numBlocks: 34, dataCodewordsPerBlock: 48 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 46, dataCodewordsPerBlock: 24 },
              { numBlocks: 10, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 2, dataCodewordsPerBlock: 15 },
              { numBlocks: 64, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 152622,
        versionNumber: 37,
        alignmentPatternCenters: [6, 28, 54, 80, 106, 132, 158],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 17, dataCodewordsPerBlock: 122 },
              { numBlocks: 4, dataCodewordsPerBlock: 123 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 29, dataCodewordsPerBlock: 46 },
              { numBlocks: 14, dataCodewordsPerBlock: 47 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 49, dataCodewordsPerBlock: 24 },
              { numBlocks: 10, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 24, dataCodewordsPerBlock: 15 },
              { numBlocks: 46, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 158308,
        versionNumber: 38,
        alignmentPatternCenters: [6, 32, 58, 84, 110, 136, 162],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 4, dataCodewordsPerBlock: 122 },
              { numBlocks: 18, dataCodewordsPerBlock: 123 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 13, dataCodewordsPerBlock: 46 },
              { numBlocks: 32, dataCodewordsPerBlock: 47 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 48, dataCodewordsPerBlock: 24 },
              { numBlocks: 14, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 42, dataCodewordsPerBlock: 15 },
              { numBlocks: 32, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 161089,
        versionNumber: 39,
        alignmentPatternCenters: [6, 26, 54, 82, 110, 138, 166],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 20, dataCodewordsPerBlock: 117 },
              { numBlocks: 4, dataCodewordsPerBlock: 118 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 40, dataCodewordsPerBlock: 47 },
              { numBlocks: 7, dataCodewordsPerBlock: 48 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 43, dataCodewordsPerBlock: 24 },
              { numBlocks: 22, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 10, dataCodewordsPerBlock: 15 },
              { numBlocks: 67, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
      {
        infoBits: 167017,
        versionNumber: 40,
        alignmentPatternCenters: [6, 30, 58, 86, 114, 142, 170],
        errorCorrectionLevels: [
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 19, dataCodewordsPerBlock: 118 },
              { numBlocks: 6, dataCodewordsPerBlock: 119 },
            ],
          },
          {
            ecCodewordsPerBlock: 28,
            ecBlocks: [
              { numBlocks: 18, dataCodewordsPerBlock: 47 },
              { numBlocks: 31, dataCodewordsPerBlock: 48 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 34, dataCodewordsPerBlock: 24 },
              { numBlocks: 34, dataCodewordsPerBlock: 25 },
            ],
          },
          {
            ecCodewordsPerBlock: 30,
            ecBlocks: [
              { numBlocks: 20, dataCodewordsPerBlock: 15 },
              { numBlocks: 61, dataCodewordsPerBlock: 16 },
            ],
          },
        ],
      },
    ],
    da = [
      { bits: 21522, formatInfo: { errorCorrectionLevel: 1, dataMask: 0 } },
      { bits: 20773, formatInfo: { errorCorrectionLevel: 1, dataMask: 1 } },
      { bits: 24188, formatInfo: { errorCorrectionLevel: 1, dataMask: 2 } },
      { bits: 23371, formatInfo: { errorCorrectionLevel: 1, dataMask: 3 } },
      { bits: 17913, formatInfo: { errorCorrectionLevel: 1, dataMask: 4 } },
      { bits: 16590, formatInfo: { errorCorrectionLevel: 1, dataMask: 5 } },
      { bits: 20375, formatInfo: { errorCorrectionLevel: 1, dataMask: 6 } },
      { bits: 19104, formatInfo: { errorCorrectionLevel: 1, dataMask: 7 } },
      { bits: 30660, formatInfo: { errorCorrectionLevel: 0, dataMask: 0 } },
      { bits: 29427, formatInfo: { errorCorrectionLevel: 0, dataMask: 1 } },
      { bits: 32170, formatInfo: { errorCorrectionLevel: 0, dataMask: 2 } },
      { bits: 30877, formatInfo: { errorCorrectionLevel: 0, dataMask: 3 } },
      { bits: 26159, formatInfo: { errorCorrectionLevel: 0, dataMask: 4 } },
      { bits: 25368, formatInfo: { errorCorrectionLevel: 0, dataMask: 5 } },
      { bits: 27713, formatInfo: { errorCorrectionLevel: 0, dataMask: 6 } },
      { bits: 26998, formatInfo: { errorCorrectionLevel: 0, dataMask: 7 } },
      { bits: 5769, formatInfo: { errorCorrectionLevel: 3, dataMask: 0 } },
      { bits: 5054, formatInfo: { errorCorrectionLevel: 3, dataMask: 1 } },
      { bits: 7399, formatInfo: { errorCorrectionLevel: 3, dataMask: 2 } },
      { bits: 6608, formatInfo: { errorCorrectionLevel: 3, dataMask: 3 } },
      { bits: 1890, formatInfo: { errorCorrectionLevel: 3, dataMask: 4 } },
      { bits: 597, formatInfo: { errorCorrectionLevel: 3, dataMask: 5 } },
      { bits: 3340, formatInfo: { errorCorrectionLevel: 3, dataMask: 6 } },
      { bits: 2107, formatInfo: { errorCorrectionLevel: 3, dataMask: 7 } },
      { bits: 13663, formatInfo: { errorCorrectionLevel: 2, dataMask: 0 } },
      { bits: 12392, formatInfo: { errorCorrectionLevel: 2, dataMask: 1 } },
      { bits: 16177, formatInfo: { errorCorrectionLevel: 2, dataMask: 2 } },
      { bits: 14854, formatInfo: { errorCorrectionLevel: 2, dataMask: 3 } },
      { bits: 9396, formatInfo: { errorCorrectionLevel: 2, dataMask: 4 } },
      { bits: 8579, formatInfo: { errorCorrectionLevel: 2, dataMask: 5 } },
      { bits: 11994, formatInfo: { errorCorrectionLevel: 2, dataMask: 6 } },
      { bits: 11245, formatInfo: { errorCorrectionLevel: 2, dataMask: 7 } },
    ],
    aa = [
      (a) => 0 === (a.y + a.x) % 2,
      (a) => 0 === a.y % 2,
      (a) => 0 === a.x % 3,
      (a) => 0 === (a.y + a.x) % 3,
      (a) => 0 === (Math.floor(a.y / 2) + Math.floor(a.x / 3)) % 2,
      (a) => 0 === ((a.x * a.y) % 2) + ((a.x * a.y) % 3),
      (a) => 0 === (((a.y * a.x) % 2) + ((a.y * a.x) % 3)) % 2,
      (a) => 0 === (((a.y + a.x) % 2) + ((a.y * a.x) % 3)) % 2,
    ],
    x = (a, b) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)),
    la = {
      inversionAttempts: 'attemptBoth',
      greyScaleWeights: {
        red: 0.2126,
        green: 0.7152,
        blue: 0.0722,
        useIntegerApproximation: !1,
      },
      canOverwriteImage: !0,
    };
  I.default = I;
  let G = 'dontInvert',
    D = { red: 77, green: 150, blue: 29, useIntegerApproximation: !0 };
  self.onmessage = (a) => {
    let b = a.data.data;
    switch (a.data.type) {
      case 'decode':
        a = I(b.data, b.width, b.height, {
          inversionAttempts: G,
          greyScaleWeights: D,
        });
        self.postMessage({ type: 'qrResult', data: a ? a.data : null });
        break;
      case 'grayscaleWeights':
        D.red = b.red;
        D.green = b.green;
        D.blue = b.blue;
        D.useIntegerApproximation = b.useIntegerApproximation;
        break;
      case 'inversionMode':
        switch (b) {
          case 'original':
            G = 'dontInvert';
            break;
          case 'invert':
            G = 'onlyInvert';
            break;
          case 'both':
            G = 'attemptBoth';
            break;
          default:
            throw Error('Invalid inversion mode');
        }
        break;
      case 'close':
        self.close();
    }
  };
})();
//# sourceMappingURL=qr-scanner-worker.min.js.map

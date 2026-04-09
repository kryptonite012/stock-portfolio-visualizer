/**
 * StockVault — Portfolio Visualizer
 * React App Source Code (Decompiled from Vite Bundle)
 *
 * NOTE: This code was extracted and prettified from a minified Vite production build.
 * Variable names are mangled (single letters) as produced by the bundler.
 *
 * Component Map:
 *   g()        — utility / helper
 *   _()        — price data initializer
 *   v(e)       — formatter helper
 *   y(e)       — currency formatter
 *   b          — user auth/storage object
 *   x()        — toast hook
 *   ee()       — Toast component
 *   S()        — SparkLine chart component
 *   C()        — DonutChart component
 *   te()       — BarChart component
 *   ne()       — ProgressBar component
 *   re         — navigation config array
 *   w()        — Sidebar component
 *   ie()       — LoginScreen component
 *   ae()       — (helper component)
 *   oe()       — Dashboard page
 *   se()       — Search page
 *   ce()       — Analytics page
 *   le()       — Contact page
 *   ue         — CSS/style object
 *   T()        — Root App component
 *   E          — CSS theme variables
 *
 * Libraries used: React 19, ReactDOM, Recharts
 * Build tool: Vite (ESM bundle)
 */

function g(e) {
  return +(e * (0.92 + Math.random() * 0.16)).toFixed(2);
}
function _() {
  let e = {};
  return (
    m.forEach((t) => {
      e[t.symbol] = g(t.base);
    }),
    e
  );
}
function v(e) {
  let t = [],
    n = e;
  for (let e = 0; e < 12; e++)
    ((n *= 0.97 + Math.random() * 0.06), t.push(+n.toFixed(2)));
  return t;
}
function y(e) {
  return `₹` + Number(e).toLocaleString(`en-IN`, { maximumFractionDigits: 0 });
}
var b = {
  getUsers: () => JSON.parse(localStorage.getItem(`sv_users`) || `[]`),
  setUsers: (e) => localStorage.setItem(`sv_users`, JSON.stringify(e)),
  getCurrent: () =>
    JSON.parse(localStorage.getItem(`sv_current_user`) || `null`),
  setCurrent: (e) => localStorage.setItem(`sv_current_user`, JSON.stringify(e)),
  clearCurrent: () => localStorage.removeItem(`sv_current_user`),
  updateUser: (e) => {
    let t = b.getUsers().map((t) => (t.email === e.email ? e : t));
    (b.setUsers(t), b.setCurrent(e));
  },
};
function x() {
  let [e, t] = (0, f.useState)({ msg: ``, visible: !1, type: `success` });
  return {
    toast: e,
    show: (0, f.useCallback)((e, n = `success`) => {
      (t({ msg: e, visible: !0, type: n }),
        setTimeout(() => t((e) => ({ ...e, visible: !1 })), 3e3));
    }, []),
  };
}
function ee({ toast: e }) {
  return (0, p.jsx)(`div`, {
    style: {
      position: `fixed`,
      bottom: 24,
      right: 24,
      zIndex: 999,
      background: `var(--surface)`,
      border: `1px solid ${e.type === `error` ? `var(--red)` : `var(--accent)`}`,
      color: e.type === `error` ? `var(--red)` : `var(--accent)`,
      padding: `12px 20px`,
      borderRadius: 10,
      fontSize: 13,
      opacity: e.visible ? 1 : 0,
      pointerEvents: e.visible ? `auto` : `none`,
      transform: e.visible ? `translateY(0)` : `translateY(10px)`,
      transition: `opacity .3s, transform .3s`,
    },
    children: e.msg,
  });
}
function S({ data: e, color: t = `#00e5a0`, height: n = 48, fill: r = !0 }) {
  if (!e || e.length < 2) return null;
  let i = n,
    a = Math.min(...e),
    o = Math.max(...e) - a || 1,
    s =
      `M` +
      e
        .map(
          (t, n) =>
            `${(n / (e.length - 1)) * 200},${i - ((t - a) / o) * (i - 4) - 2}`,
        )
        .join(` L`);
  return (0, p.jsxs)(`svg`, {
    viewBox: `0 0 200 ${i}`,
    preserveAspectRatio: `none`,
    style: { width: `100%`, height: n },
    children: [
      r &&
        (0, p.jsx)(`defs`, {
          children: (0, p.jsxs)(`linearGradient`, {
            id: `sg${t.replace(/[^a-z]/gi, ``)}`,
            x1: `0`,
            y1: `0`,
            x2: `0`,
            y2: `1`,
            children: [
              (0, p.jsx)(`stop`, {
                offset: `0%`,
                stopColor: t,
                stopOpacity: `0.25`,
              }),
              (0, p.jsx)(`stop`, {
                offset: `100%`,
                stopColor: t,
                stopOpacity: `0`,
              }),
            ],
          }),
        }),
      r &&
        (0, p.jsx)(`path`, {
          d: `${s} L200,${i} L0,${i} Z`,
          fill: `url(#sg${t.replace(/[^a-z]/gi, ``)})`,
        }),
      (0, p.jsx)(`path`, {
        d: s,
        fill: `none`,
        stroke: t,
        strokeWidth: `1.8`,
        strokeLinecap: `round`,
        strokeLinejoin: `round`,
      }),
    ],
  });
}
function C({ slices: e, size: t = 180 }) {
  let n = t / 2,
    r = t / 2,
    i = t * 0.38,
    a = t * 0.22,
    o = -Math.PI / 2,
    s = e.reduce((e, t) => e + t.value, 0),
    c = e.map((e) => {
      let t = (e.value / s) * 2 * Math.PI,
        c = n + i * Math.cos(o),
        l = r + i * Math.sin(o);
      o += t;
      let u = n + i * Math.cos(o),
        d = r + i * Math.sin(o),
        f = n + a * Math.cos(o - t),
        p = r + a * Math.sin(o - t),
        m = n + a * Math.cos(o),
        h = r + a * Math.sin(o),
        g = t > Math.PI ? 1 : 0;
      return {
        ...e,
        d: `M${c},${l} A${i},${i} 0 ${g} 1 ${u},${d} L${m},${h} A${a},${a} 0 ${g} 0 ${f},${p} Z`,
      };
    });
  return (0, p.jsx)(`svg`, {
    viewBox: `0 0 ${t} ${t}`,
    style: { width: t, height: t },
    children: c.map((e, t) =>
      (0, p.jsx)(`path`, { d: e.d, fill: e.color, opacity: 0.9 }, t),
    ),
  });
}
function te({ data: e }) {
  let t = Math.max(...e.map((e) => Math.abs(e.value)));
  return (0, p.jsx)(`div`, {
    style: {
      display: `flex`,
      alignItems: `flex-end`,
      gap: 6,
      height: 120,
      padding: `0 4px`,
    },
    children: e.map((e, n) =>
      (0, p.jsxs)(
        `div`,
        {
          style: {
            flex: 1,
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
            gap: 4,
          },
          children: [
            (0, p.jsxs)(`div`, {
              style: {
                fontSize: 10,
                color: e.value >= 0 ? `var(--accent)` : `var(--red)`,
                fontFamily: `var(--font-mono)`,
              },
              children: [e.value >= 0 ? `+` : ``, e.value.toFixed(1), `%`],
            }),
            (0, p.jsx)(`div`, {
              style: {
                width: `100%`,
                height: (Math.abs(e.value) / t) * 80 + `px`,
                minHeight: 4,
                background: e.value >= 0 ? `var(--accent)` : `var(--red)`,
                borderRadius: `4px 4px 0 0`,
                opacity: 0.8,
              },
            }),
            (0, p.jsx)(`div`, {
              style: {
                fontSize: 9,
                color: `var(--muted)`,
                fontFamily: `var(--font-mono)`,
                textAlign: `center`,
              },
              children: e.label,
            }),
          ],
        },
        n,
      ),
    ),
  });
}
function ne({ value: e, max: t, color: n }) {
  return (0, p.jsx)(`div`, {
    style: {
      background: `rgba(255,255,255,0.06)`,
      borderRadius: 4,
      height: 6,
      overflow: `hidden`,
    },
    children: (0, p.jsx)(`div`, {
      style: {
        width: `${Math.min((e / t) * 100, 100)}%`,
        height: `100%`,
        background: n,
        borderRadius: 4,
        transition: `width .5s`,
      },
    }),
  });
}
var re = [
  {
    id: `dashboard`,
    label: `Dashboard`,
    section: `Main`,
    icon: (0, p.jsxs)(`svg`, {
      viewBox: `0 0 20 20`,
      fill: `none`,
      stroke: `currentColor`,
      strokeWidth: `1.6`,
      children: [
        (0, p.jsx)(`rect`, {
          x: `2`,
          y: `2`,
          width: `7`,
          height: `7`,
          rx: `1.5`,
        }),
        (0, p.jsx)(`rect`, {
          x: `11`,
          y: `2`,
          width: `7`,
          height: `7`,
          rx: `1.5`,
        }),
        (0, p.jsx)(`rect`, {
          x: `2`,
          y: `11`,
          width: `7`,
          height: `7`,
          rx: `1.5`,
        }),
        (0, p.jsx)(`rect`, {
          x: `11`,
          y: `11`,
          width: `7`,
          height: `7`,
          rx: `1.5`,
        }),
      ],
    }),
  },
  {
    id: `search`,
    label: `Search Stocks`,
    section: null,
    icon: (0, p.jsxs)(`svg`, {
      viewBox: `0 0 20 20`,
      fill: `none`,
      stroke: `currentColor`,
      strokeWidth: `1.6`,
      children: [
        (0, p.jsx)(`circle`, { cx: `9`, cy: `9`, r: `6` }),
        (0, p.jsx)(`line`, { x1: `13.5`, y1: `13.5`, x2: `18`, y2: `18` }),
      ],
    }),
  },
  {
    id: `analytics`,
    label: `Analytics`,
    section: null,
    icon: (0, p.jsxs)(`svg`, {
      viewBox: `0 0 20 20`,
      fill: `none`,
      stroke: `currentColor`,
      strokeWidth: `1.6`,
      children: [
        (0, p.jsx)(`polyline`, { points: `2,16 7,10 11,13 18,5` }),
        (0, p.jsx)(`line`, { x1: `2`, y1: `16`, x2: `18`, y2: `16` }),
      ],
    }),
  },
  {
    id: `contact`,
    label: `Contact Us`,
    section: `Account`,
    icon: (0, p.jsxs)(`svg`, {
      viewBox: `0 0 20 20`,
      fill: `none`,
      stroke: `currentColor`,
      strokeWidth: `1.6`,
      children: [
        (0, p.jsx)(`path`, {
          d: `M4 6.5L9.2 10.3C9.7 10.7 10.3 10.7 10.8 10.3L16 6.5`,
        }),
        (0, p.jsx)(`rect`, {
          x: `2`,
          y: `4`,
          width: `16`,
          height: `12`,
          rx: `2`,
        }),
      ],
    }),
  },
];
function w({ page: e, setPage: t, user: n, onLogout: r }) {
  let [i, a] = (0, f.useState)(!1);
  return (0, p.jsxs)(`nav`, {
    style: {
      width: i ? 64 : 220,
      minHeight: `100vh`,
      background: `var(--bg2)`,
      borderRight: `1px solid var(--border)`,
      display: `flex`,
      flexDirection: `column`,
      padding: `24px 0`,
      position: `fixed`,
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      transition: `width .2s`,
    },
    children: [
      (0, p.jsxs)(`div`, {
        style: {
          display: `flex`,
          alignItems: `center`,
          gap: 8,
          padding: i ? `0 16px 28px` : `0 24px 28px`,
          borderBottom: `1px solid var(--border)`,
          marginBottom: 16,
        },
        children: [
          (0, p.jsx)(`div`, {
            style: {
              width: 32,
              height: 32,
              background: `var(--accent)`,
              borderRadius: 7,
              display: `flex`,
              alignItems: `center`,
              justifyContent: `center`,
              flexShrink: 0,
            },
            children: (0, p.jsxs)(`svg`, {
              viewBox: `0 0 20 20`,
              fill: `none`,
              style: { width: 18, height: 18 },
              children: [
                (0, p.jsx)(`polyline`, {
                  points: `2,14 7,8 11,11 18,4`,
                  stroke: `#0a0a0f`,
                  strokeWidth: `2.2`,
                  strokeLinecap: `round`,
                  strokeLinejoin: `round`,
                }),
                (0, p.jsx)(`polyline`, {
                  points: `14,4 18,4 18,8`,
                  stroke: `#0a0a0f`,
                  strokeWidth: `2.2`,
                  strokeLinecap: `round`,
                  strokeLinejoin: `round`,
                }),
              ],
            }),
          }),
          !i &&
            (0, p.jsx)(`span`, {
              style: { fontFamily: `var(--font-serif)`, fontSize: 18 },
              children: `StockVault`,
            }),
        ],
      }),
      re.map((n, r) =>
        (0, p.jsxs)(
          `div`,
          {
            children: [
              n.section &&
                (r === 0 || re[r - 1]?.section !== n.section) &&
                !i &&
                (0, p.jsx)(`div`, {
                  style: {
                    padding: `16px 24px 6px`,
                    fontSize: 10,
                    letterSpacing: `1.5px`,
                    color: `var(--muted)`,
                    textTransform: `uppercase`,
                  },
                  children: n.section,
                }),
              (0, p.jsxs)(`div`, {
                onClick: () => t(n.id),
                style: {
                  display: `flex`,
                  alignItems: `center`,
                  gap: 10,
                  padding: i ? `10px 20px` : `10px 24px`,
                  cursor: `pointer`,
                  color: e === n.id ? `var(--accent)` : `var(--muted)`,
                  fontSize: 14,
                  borderLeft: `3px solid ${e === n.id ? `var(--accent)` : `transparent`}`,
                  background:
                    e === n.id ? `rgba(0,229,160,0.05)` : `transparent`,
                  transition: `all .15s`,
                },
                onMouseEnter: (t) => {
                  e !== n.id &&
                    ((t.currentTarget.style.color = `var(--text)`),
                    (t.currentTarget.style.background = `rgba(255,255,255,0.03)`));
                },
                onMouseLeave: (t) => {
                  e !== n.id &&
                    ((t.currentTarget.style.color = `var(--muted)`),
                    (t.currentTarget.style.background = `transparent`));
                },
                children: [
                  (0, p.jsx)(`span`, {
                    style: { width: 17, height: 17, flexShrink: 0 },
                    children: n.icon,
                  }),
                  !i && n.label,
                ],
              }),
            ],
          },
          n.id,
        ),
      ),
      (0, p.jsxs)(`div`, {
        style: {
          marginTop: `auto`,
          padding: i ? `16px` : `16px 24px`,
          borderTop: `1px solid var(--border)`,
          display: `flex`,
          alignItems: `center`,
          gap: 10,
        },
        children: [
          (0, p.jsx)(`div`, {
            style: {
              width: 34,
              height: 34,
              background: `var(--accent2)`,
              borderRadius: `50%`,
              display: `flex`,
              alignItems: `center`,
              justifyContent: `center`,
              fontSize: 14,
              fontWeight: 500,
              color: `#fff`,
              flexShrink: 0,
            },
            children: n?.name?.[0]?.toUpperCase(),
          }),
          !i &&
            (0, p.jsxs)(p.Fragment, {
              children: [
                (0, p.jsxs)(`div`, {
                  children: [
                    (0, p.jsx)(`div`, {
                      style: {
                        fontSize: 13,
                        color: `var(--text)`,
                        whiteSpace: `nowrap`,
                        overflow: `hidden`,
                        textOverflow: `ellipsis`,
                        maxWidth: 100,
                      },
                      children: n?.name,
                    }),
                    (0, p.jsx)(`div`, {
                      style: {
                        fontSize: 11,
                        color: `var(--muted)`,
                        whiteSpace: `nowrap`,
                        overflow: `hidden`,
                        textOverflow: `ellipsis`,
                        maxWidth: 100,
                      },
                      children: n?.email,
                    }),
                  ],
                }),
                (0, p.jsx)(`button`, {
                  onClick: r,
                  title: `Logout`,
                  style: {
                    marginLeft: `auto`,
                    background: `none`,
                    border: `none`,
                    cursor: `pointer`,
                    color: `var(--muted)`,
                    fontSize: 16,
                  },
                  onMouseEnter: (e) =>
                    (e.currentTarget.style.color = `var(--red)`),
                  onMouseLeave: (e) =>
                    (e.currentTarget.style.color = `var(--muted)`),
                  children: `⇤`,
                }),
              ],
            }),
        ],
      }),
      (0, p.jsx)(`div`, {
        onClick: () => a((e) => !e),
        style: {
          position: `absolute`,
          top: `50%`,
          right: -12,
          width: 24,
          height: 24,
          background: `var(--surface)`,
          border: `1px solid var(--border)`,
          borderRadius: `50%`,
          display: `flex`,
          alignItems: `center`,
          justifyContent: `center`,
          cursor: `pointer`,
          fontSize: 10,
          color: `var(--muted)`,
          transform: `translateY(-50%)`,
        },
        children: i ? `›` : `‹`,
      }),
    ],
  });
}
function ie({ onLogin: e }) {
  let [t, n] = (0, f.useState)(`login`),
    [r, i] = (0, f.useState)({ name: ``, email: ``, password: `` }),
    [a, o] = (0, f.useState)(``),
    s = () => {
      let t = b
        .getUsers()
        .find((e) => e.email === r.email && e.password === r.password);
      if (!t) {
        o(`Invalid email or password.`);
        return;
      }
      (b.setCurrent(t), e(t));
    },
    c = () => {
      let t = b.getUsers();
      if (t.find((e) => e.email === r.email)) {
        o(`Email already registered.`);
        return;
      }
      let n = {
        name: r.name,
        email: r.email,
        password: r.password,
        balance: 5e5,
        portfolio: [],
      };
      (b.setUsers([...t, n]), b.setCurrent(n), e(n));
    };
  return (0, p.jsxs)(`div`, {
    style: {
      display: `flex`,
      minHeight: `100vh`,
      background: `var(--bg)`,
      overflow: `hidden`,
    },
    children: [
      (0, p.jsxs)(`div`, {
        style: {
          width: `55%`,
          background: `var(--bg2)`,
          display: `flex`,
          flexDirection: `column`,
          justifyContent: `center`,
          padding: `60px 64px`,
          position: `relative`,
          overflow: `hidden`,
        },
        children: [
          (0, p.jsx)(`div`, {
            style: {
              position: `absolute`,
              width: 600,
              height: 600,
              background: `radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%)`,
              top: -100,
              left: -100,
              pointerEvents: `none`,
            },
          }),
          (0, p.jsx)(`div`, {
            style: {
              position: `absolute`,
              width: 400,
              height: 400,
              background: `radial-gradient(circle, rgba(124,106,255,0.06) 0%, transparent 70%)`,
              bottom: -50,
              right: 40,
              pointerEvents: `none`,
            },
          }),
          (0, p.jsxs)(`div`, {
            style: {
              display: `flex`,
              alignItems: `center`,
              gap: 10,
              marginBottom: 60,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: {
                  width: 36,
                  height: 36,
                  background: `var(--accent)`,
                  borderRadius: 8,
                  display: `flex`,
                  alignItems: `center`,
                  justifyContent: `center`,
                },
                children: (0, p.jsxs)(`svg`, {
                  viewBox: `0 0 20 20`,
                  fill: `none`,
                  style: { width: 20, height: 20 },
                  children: [
                    (0, p.jsx)(`polyline`, {
                      points: `2,14 7,8 11,11 18,4`,
                      stroke: `#0a0a0f`,
                      strokeWidth: `2.2`,
                      strokeLinecap: `round`,
                      strokeLinejoin: `round`,
                    }),
                    (0, p.jsx)(`polyline`, {
                      points: `14,4 18,4 18,8`,
                      stroke: `#0a0a0f`,
                      strokeWidth: `2.2`,
                      strokeLinecap: `round`,
                      strokeLinejoin: `round`,
                    }),
                  ],
                }),
              }),
              (0, p.jsx)(`span`, {
                style: { fontFamily: `var(--font-serif)`, fontSize: 22 },
                children: `StockVault`,
              }),
            ],
          }),
          (0, p.jsxs)(`h1`, {
            style: {
              fontFamily: `var(--font-serif)`,
              fontSize: 52,
              lineHeight: 1.1,
              marginBottom: 20,
            },
            children: [
              `Track your`,
              (0, p.jsx)(`br`, {}),
              `wealth, `,
              (0, p.jsx)(`em`, {
                style: { color: `var(--accent)`, fontStyle: `italic` },
                children: `visually`,
              }),
              `.`,
            ],
          }),
          (0, p.jsx)(`p`, {
            style: {
              color: `var(--muted)`,
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 380,
              marginBottom: 50,
            },
            children: `Real-time portfolio tracking with beautiful charts, live prices, and deep analytics — all in one place.`,
          }),
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 16,
              padding: `20px 24px`,
              maxWidth: 420,
            },
            children: [
              (0, p.jsxs)(`div`, {
                style: {
                  display: `flex`,
                  justifyContent: `space-between`,
                  alignItems: `center`,
                  marginBottom: 16,
                },
                children: [
                  (0, p.jsxs)(`div`, {
                    children: [
                      (0, p.jsx)(`div`, {
                        style: {
                          fontSize: 12,
                          color: `var(--muted)`,
                          marginBottom: 2,
                        },
                        children: `Portfolio Value`,
                      }),
                      (0, p.jsx)(`strong`, {
                        style: { fontFamily: `var(--font-mono)`, fontSize: 20 },
                        children: `₹2,84,350`,
                      }),
                    ],
                  }),
                  (0, p.jsx)(`span`, {
                    style: {
                      background: `rgba(0,229,160,0.12)`,
                      color: `var(--accent)`,
                      fontSize: 12,
                      fontFamily: `var(--font-mono)`,
                      padding: `3px 8px`,
                      borderRadius: 20,
                    },
                    children: `▲ +8.34%`,
                  }),
                ],
              }),
              (0, p.jsx)(S, {
                data: [50, 44, 46, 36, 38, 28, 30, 18, 14, 10, 5, 3].map(
                  (e) => 60 - e,
                ),
                color: `var(--accent)`,
                height: 60,
              }),
            ],
          }),
          (0, p.jsx)(`div`, {
            style: {
              display: `flex`,
              gap: 10,
              marginTop: 20,
              flexWrap: `wrap`,
            },
            children: [
              [`RELIANCE`, `₹2,847`, `+1.2%`, !0],
              [`TCS`, `₹3,920`, `+0.8%`, !0],
              [`INFY`, `₹1,432`, `-0.4%`, !1],
              [`HDFC`, `₹1,698`, `+2.1%`, !0],
            ].map(([e, t, n, r]) =>
              (0, p.jsxs)(
                `div`,
                {
                  style: {
                    background: `var(--bg3)`,
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: `6px 12px`,
                    fontFamily: `var(--font-mono)`,
                    fontSize: 12,
                    display: `flex`,
                    gap: 8,
                    alignItems: `center`,
                  },
                  children: [
                    (0, p.jsx)(`span`, {
                      style: { color: `var(--text)`, fontWeight: 500 },
                      children: e,
                    }),
                    (0, p.jsx)(`span`, {
                      style: { color: `var(--muted)` },
                      children: t,
                    }),
                    (0, p.jsx)(`span`, {
                      style: { color: r ? `var(--accent)` : `var(--red)` },
                      children: n,
                    }),
                  ],
                },
                e,
              ),
            ),
          }),
        ],
      }),
      (0, p.jsxs)(`div`, {
        style: {
          width: `45%`,
          display: `flex`,
          flexDirection: `column`,
          justifyContent: `center`,
          padding: `60px 64px`,
        },
        children: [
          (0, p.jsx)(`div`, {
            style: {
              display: `flex`,
              border: `1px solid var(--border)`,
              borderRadius: 10,
              overflow: `hidden`,
              width: `fit-content`,
              marginBottom: 32,
            },
            children: [`login`, `signup`].map((e) =>
              (0, p.jsx)(
                `button`,
                {
                  onClick: () => {
                    (n(e), o(``));
                  },
                  style: {
                    padding: `8px 24px`,
                    fontSize: 14,
                    cursor: `pointer`,
                    border: `none`,
                    background: t === e ? `var(--surface)` : `transparent`,
                    color: t === e ? `var(--text)` : `var(--muted)`,
                    transition: `all .2s`,
                    fontFamily: `var(--font-sans)`,
                  },
                  children: e === `login` ? `Sign In` : `Sign Up`,
                },
                e,
              ),
            ),
          }),
          t === `login`
            ? (0, p.jsxs)(p.Fragment, {
                children: [
                  (0, p.jsx)(`h2`, {
                    style: {
                      fontFamily: `var(--font-serif)`,
                      fontSize: 32,
                      marginBottom: 8,
                    },
                    children: `Welcome back`,
                  }),
                  (0, p.jsx)(`p`, {
                    style: {
                      color: `var(--muted)`,
                      fontSize: 14,
                      marginBottom: 32,
                    },
                    children: `Sign in to view your portfolio`,
                  }),
                  a &&
                    (0, p.jsx)(`div`, {
                      style: {
                        background: `rgba(255,84,112,0.1)`,
                        border: `1px solid rgba(255,84,112,0.3)`,
                        color: `var(--red)`,
                        padding: `10px 14px`,
                        borderRadius: 8,
                        fontSize: 13,
                        marginBottom: 16,
                      },
                      children: a,
                    }),
                  (0, p.jsx)(ae, {
                    label: `Email address`,
                    type: `email`,
                    placeholder: `you@example.com`,
                    value: r.email,
                    onChange: (e) => i((t) => ({ ...t, email: e })),
                  }),
                  (0, p.jsx)(ae, {
                    label: `Password`,
                    type: `password`,
                    placeholder: `••••••••`,
                    value: r.password,
                    onChange: (e) => i((t) => ({ ...t, password: e })),
                    onEnter: s,
                  }),
                  (0, p.jsx)(`button`, {
                    onClick: s,
                    style: ue.btnPrimary,
                    children: `Sign In →`,
                  }),
                  (0, p.jsxs)(`p`, {
                    style: {
                      textAlign: `center`,
                      marginTop: 20,
                      fontSize: 13,
                      color: `var(--muted)`,
                    },
                    children: [
                      `No account? `,
                      (0, p.jsx)(`span`, {
                        onClick: () => n(`signup`),
                        style: { color: `var(--accent)`, cursor: `pointer` },
                        children: `Create one free`,
                      }),
                    ],
                  }),
                  (0, p.jsx)(`p`, {
                    style: { textAlign: `center`, marginTop: 8, fontSize: 13 },
                    children: (0, p.jsx)(`span`, {
                      onClick: () => {
                        let t = b.getUsers(),
                          n = {
                            name: `Demo User`,
                            email: `demo@stockvault.in`,
                            password: `demo123`,
                            balance: 5e5,
                            portfolio: [
                              {
                                symbol: `RELIANCE`,
                                name: `Reliance Industries`,
                                qty: 10,
                                buyPrice: 2600,
                                sector: `Energy`,
                              },
                              {
                                symbol: `TCS`,
                                name: `Tata Consultancy Services`,
                                qty: 5,
                                buyPrice: 3800,
                                sector: `IT`,
                              },
                              {
                                symbol: `INFY`,
                                name: `Infosys Ltd`,
                                qty: 8,
                                buyPrice: 1400,
                                sector: `IT`,
                              },
                              {
                                symbol: `HDFC`,
                                name: `HDFC Bank`,
                                qty: 12,
                                buyPrice: 1600,
                                sector: `Finance`,
                              },
                              {
                                symbol: `WIPRO`,
                                name: `Wipro Ltd`,
                                qty: 20,
                                buyPrice: 420,
                                sector: `IT`,
                              },
                            ],
                          };
                        (t.find((e) => e.email === n.email) ||
                          b.setUsers([...t, n]),
                          b.setCurrent(n),
                          e(n));
                      },
                      style: { color: `var(--accent2)`, cursor: `pointer` },
                      children: `🚀 Try Demo Account`,
                    }),
                  }),
                ],
              })
            : (0, p.jsxs)(p.Fragment, {
                children: [
                  (0, p.jsx)(`h2`, {
                    style: {
                      fontFamily: `var(--font-serif)`,
                      fontSize: 32,
                      marginBottom: 8,
                    },
                    children: `Create account`,
                  }),
                  (0, p.jsx)(`p`, {
                    style: {
                      color: `var(--muted)`,
                      fontSize: 14,
                      marginBottom: 32,
                    },
                    children: `Start tracking your portfolio today`,
                  }),
                  a &&
                    (0, p.jsx)(`div`, {
                      style: {
                        background: `rgba(255,84,112,0.1)`,
                        border: `1px solid rgba(255,84,112,0.3)`,
                        color: `var(--red)`,
                        padding: `10px 14px`,
                        borderRadius: 8,
                        fontSize: 13,
                        marginBottom: 16,
                      },
                      children: a,
                    }),
                  (0, p.jsx)(ae, {
                    label: `Full name`,
                    placeholder: `Rahul Sharma`,
                    value: r.name,
                    onChange: (e) => i((t) => ({ ...t, name: e })),
                  }),
                  (0, p.jsx)(ae, {
                    label: `Email address`,
                    type: `email`,
                    placeholder: `you@example.com`,
                    value: r.email,
                    onChange: (e) => i((t) => ({ ...t, email: e })),
                  }),
                  (0, p.jsx)(ae, {
                    label: `Password`,
                    type: `password`,
                    placeholder: `Min 6 characters`,
                    value: r.password,
                    onChange: (e) => i((t) => ({ ...t, password: e })),
                    onEnter: c,
                  }),
                  (0, p.jsx)(`button`, {
                    onClick: c,
                    style: ue.btnPrimary,
                    children: `Create Account →`,
                  }),
                  (0, p.jsxs)(`p`, {
                    style: {
                      textAlign: `center`,
                      marginTop: 20,
                      fontSize: 13,
                      color: `var(--muted)`,
                    },
                    children: [
                      `Have an account? `,
                      (0, p.jsx)(`span`, {
                        onClick: () => n(`login`),
                        style: { color: `var(--accent)`, cursor: `pointer` },
                        children: `Sign in`,
                      }),
                    ],
                  }),
                ],
              }),
        ],
      }),
    ],
  });
}
function ae({
  label: e,
  type: t = `text`,
  placeholder: n,
  value: r,
  onChange: i,
  onEnter: a,
}) {
  return (0, p.jsxs)(`div`, {
    style: { marginBottom: 18 },
    children: [
      (0, p.jsx)(`label`, {
        style: {
          display: `block`,
          fontSize: 13,
          color: `var(--muted)`,
          marginBottom: 6,
        },
        children: e,
      }),
      (0, p.jsx)(`input`, {
        type: t,
        placeholder: n,
        value: r,
        onChange: (e) => i(e.target.value),
        onKeyDown: (e) => e.key === `Enter` && a?.(),
        style: {
          width: `100%`,
          padding: `12px 16px`,
          background: `var(--surface)`,
          border: `1px solid var(--border)`,
          borderRadius: 10,
          color: `var(--text)`,
          fontFamily: `var(--font-sans)`,
          fontSize: 15,
          outline: `none`,
        },
        onFocus: (e) => (e.target.style.borderColor = `var(--accent)`),
        onBlur: (e) => (e.target.style.borderColor = `var(--border)`),
      }),
    ],
  });
}
function oe({ user: e, setUser: t, prices: n, showToast: r }) {
  let i = e.portfolio || [],
    a = i.map((e) => {
      let t = n[e.symbol] || e.buyPrice,
        r = e.qty * e.buyPrice,
        i = e.qty * t,
        a = i - r;
      return { ...e, cur: t, inv: r, val: i, pnl: a, pct: (a / r) * 100 };
    }),
    o = a.reduce((e, t) => e + t.val, 0),
    s = a.reduce((e, t) => e + t.inv, 0),
    c = o - s,
    l = o * (Math.random() * 0.04 - 0.01),
    u = Array.from(
      { length: 20 },
      (e, t) => o * (0.85 + (t / 19) * 0.18 + (Math.random() - 0.5) * 0.04),
    ),
    d = (i) => {
      let a = { ...e, portfolio: e.portfolio.filter((e) => e.symbol !== i) },
        o = e.portfolio.find((e) => e.symbol === i),
        s = n[i] || o.buyPrice;
      ((a.balance = (a.balance || 0) + o.qty * s),
        b.updateUser(a),
        t(a),
        r(`Sold ${i} for ${y(o.qty * s)}`));
    };
  return (0, p.jsxs)(`div`, {
    children: [
      (0, p.jsxs)(`div`, {
        style: {
          display: `flex`,
          justifyContent: `space-between`,
          alignItems: `center`,
          marginBottom: 32,
        },
        children: [
          (0, p.jsxs)(`div`, {
            children: [
              (0, p.jsx)(`div`, {
                style: { fontFamily: `var(--font-serif)`, fontSize: 28 },
                children: `Dashboard`,
              }),
              (0, p.jsxs)(`div`, {
                style: { fontSize: 13, color: `var(--muted)`, marginTop: 2 },
                children: [`Welcome back, `, e.name.split(` `)[0], ` 👋`],
              }),
            ],
          }),
          (0, p.jsxs)(`div`, {
            style: {
              fontFamily: `var(--font-mono)`,
              fontSize: 13,
              color: `var(--muted)`,
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 8,
              padding: `6px 14px`,
            },
            children: [
              `Balance: `,
              (0, p.jsx)(`span`, {
                style: { color: `var(--text)` },
                children: y(e.balance),
              }),
            ],
          }),
        ],
      }),
      (0, p.jsx)(`div`, {
        style: {
          display: `grid`,
          gridTemplateColumns: `repeat(4,1fr)`,
          gap: 16,
          marginBottom: 24,
        },
        children: [
          {
            label: `Portfolio Value`,
            value: y(o),
            change: `${l >= 0 ? `▲ +` : `▼ `}${y(Math.abs(l))} today`,
            up: l >= 0,
          },
          {
            label: `Total Invested`,
            value: y(s),
            change: `${i.length} holdings`,
          },
          {
            label: `Total P&L`,
            value: y(c),
            change: `${c >= 0 ? `+` : ``}${s ? ((c / s) * 100).toFixed(2) : 0}% return`,
            up: c >= 0,
          },
          {
            label: `Available Cash`,
            value: y(e.balance),
            change: `${((e.balance / (o + e.balance)) * 100).toFixed(1)}% of total`,
          },
        ].map((e, t) =>
          (0, p.jsxs)(
            `div`,
            {
              style: {
                background: `var(--surface)`,
                border: `1px solid var(--border)`,
                borderRadius: 14,
                padding: `20px 22px`,
              },
              children: [
                (0, p.jsx)(`div`, {
                  style: {
                    fontSize: 12,
                    color: `var(--muted)`,
                    marginBottom: 6,
                  },
                  children: e.label,
                }),
                (0, p.jsx)(`div`, {
                  style: {
                    fontFamily: `var(--font-mono)`,
                    fontSize: 22,
                    fontWeight: 500,
                  },
                  children: e.value,
                }),
                (0, p.jsx)(`div`, {
                  style: {
                    fontSize: 12,
                    marginTop: 4,
                    fontFamily: `var(--font-mono)`,
                    color:
                      e.up === !0
                        ? `var(--accent)`
                        : e.up === !1
                          ? `var(--red)`
                          : `var(--muted)`,
                  },
                  children: e.change,
                }),
              ],
            },
            t,
          ),
        ),
      }),
      (0, p.jsxs)(`div`, {
        style: {
          display: `grid`,
          gridTemplateColumns: `2fr 1fr`,
          gap: 16,
          marginBottom: 24,
        },
        children: [
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `22px 24px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: {
                  display: `flex`,
                  justifyContent: `space-between`,
                  alignItems: `center`,
                  marginBottom: 20,
                },
                children: (0, p.jsxs)(`div`, {
                  children: [
                    (0, p.jsx)(`div`, {
                      style: { fontSize: 15, fontWeight: 500 },
                      children: `Portfolio Performance`,
                    }),
                    (0, p.jsx)(`div`, {
                      style: {
                        fontSize: 12,
                        color: `var(--muted)`,
                        marginTop: 2,
                      },
                      children: `20-day trend`,
                    }),
                  ],
                }),
              }),
              (0, p.jsx)(S, {
                data: u,
                color: `var(--accent)`,
                height: 160,
                fill: !0,
              }),
            ],
          }),
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `22px 24px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: { fontSize: 15, fontWeight: 500, marginBottom: 20 },
                children: `Sector Weights`,
              }),
              i.length === 0
                ? (0, p.jsx)(`div`, {
                    style: { color: `var(--muted)`, fontSize: 13 },
                    children: `No holdings`,
                  })
                : (() => {
                    let e = {};
                    a.forEach((t) => {
                      e[t.sector] = (e[t.sector] || 0) + t.val;
                    });
                    let t = [
                        `var(--accent)`,
                        `var(--accent2)`,
                        `var(--amber)`,
                        `var(--red)`,
                        `#38bdf8`,
                        `#fb923c`,
                      ],
                      n = Object.entries(e),
                      r = n.reduce((e, [, t]) => e + t, 0);
                    return (0, p.jsxs)(p.Fragment, {
                      children: [
                        (0, p.jsx)(C, {
                          slices: n.map(([e, n], r) => ({
                            label: e,
                            value: n,
                            color: t[r % t.length],
                          })),
                          size: 140,
                        }),
                        (0, p.jsx)(`div`, {
                          style: { marginTop: 12 },
                          children: n.map(([e, n], i) =>
                            (0, p.jsxs)(
                              `div`,
                              {
                                style: {
                                  display: `flex`,
                                  justifyContent: `space-between`,
                                  alignItems: `center`,
                                  marginBottom: 6,
                                },
                                children: [
                                  (0, p.jsxs)(`div`, {
                                    style: {
                                      display: `flex`,
                                      alignItems: `center`,
                                      gap: 6,
                                    },
                                    children: [
                                      (0, p.jsx)(`div`, {
                                        style: {
                                          width: 8,
                                          height: 8,
                                          borderRadius: `50%`,
                                          background: t[i % t.length],
                                        },
                                      }),
                                      (0, p.jsx)(`span`, {
                                        style: {
                                          fontSize: 12,
                                          color: `var(--muted)`,
                                        },
                                        children: e,
                                      }),
                                    ],
                                  }),
                                  (0, p.jsxs)(`span`, {
                                    style: {
                                      fontSize: 12,
                                      fontFamily: `var(--font-mono)`,
                                    },
                                    children: [((n / r) * 100).toFixed(1), `%`],
                                  }),
                                ],
                              },
                              e,
                            ),
                          ),
                        }),
                      ],
                    });
                  })(),
            ],
          }),
        ],
      }),
      (0, p.jsxs)(`div`, {
        style: {
          background: `var(--surface)`,
          border: `1px solid var(--border)`,
          borderRadius: 14,
          padding: `22px 24px`,
          marginBottom: 24,
        },
        children: [
          (0, p.jsx)(`div`, {
            style: { fontSize: 15, fontWeight: 500, marginBottom: 20 },
            children: `Holdings`,
          }),
          i.length === 0
            ? (0, p.jsxs)(`div`, {
                style: {
                  textAlign: `center`,
                  padding: `40px 0`,
                  color: `var(--muted)`,
                },
                children: [
                  (0, p.jsx)(`div`, {
                    style: { fontSize: 40, marginBottom: 12 },
                    children: `📈`,
                  }),
                  (0, p.jsx)(`div`, {
                    style: { marginBottom: 8 },
                    children: `No holdings yet`,
                  }),
                  (0, p.jsx)(`div`, {
                    style: { fontSize: 13 },
                    children: `Search and buy stocks to get started`,
                  }),
                ],
              })
            : (0, p.jsx)(`div`, {
                style: { overflowX: `auto` },
                children: (0, p.jsxs)(`table`, {
                  style: { width: `100%`, borderCollapse: `collapse` },
                  children: [
                    (0, p.jsx)(`thead`, {
                      children: (0, p.jsx)(`tr`, {
                        children: [
                          `Stock`,
                          `Sector`,
                          `Qty`,
                          `Buy Price`,
                          `CMP`,
                          `Current Value`,
                          `P&L`,
                          `Action`,
                        ].map((e) =>
                          (0, p.jsx)(
                            `th`,
                            {
                              style: {
                                textAlign: `left`,
                                fontSize: 11,
                                letterSpacing: 1,
                                textTransform: `uppercase`,
                                color: `var(--muted)`,
                                padding: `10px 14px`,
                                borderBottom: `1px solid var(--border)`,
                                fontWeight: 400,
                              },
                              children: e,
                            },
                            e,
                          ),
                        ),
                      }),
                    }),
                    (0, p.jsx)(`tbody`, {
                      children: a.map((e) =>
                        (0, p.jsxs)(
                          `tr`,
                          {
                            onMouseEnter: (e) =>
                              Array.from(e.currentTarget.cells).forEach(
                                (e) =>
                                  (e.style.background = `rgba(255,255,255,0.02)`),
                              ),
                            onMouseLeave: (e) =>
                              Array.from(e.currentTarget.cells).forEach(
                                (e) => (e.style.background = ``),
                              ),
                            children: [
                              (0, p.jsxs)(`td`, {
                                style: { padding: `13px 14px`, fontSize: 14 },
                                children: [
                                  (0, p.jsx)(`div`, {
                                    style: {
                                      fontFamily: `var(--font-mono)`,
                                      fontSize: 13,
                                      fontWeight: 500,
                                    },
                                    children: e.symbol,
                                  }),
                                  (0, p.jsx)(`div`, {
                                    style: {
                                      fontSize: 11,
                                      color: `var(--muted)`,
                                      marginTop: 1,
                                    },
                                    children: e.name,
                                  }),
                                ],
                              }),
                              (0, p.jsx)(`td`, {
                                style: { padding: `13px 14px` },
                                children: (0, p.jsx)(`span`, {
                                  style: {
                                    padding: `2px 8px`,
                                    borderRadius: 4,
                                    fontSize: 11,
                                    background: `rgba(124,106,255,0.12)`,
                                    color: `var(--accent2)`,
                                  },
                                  children: e.sector,
                                }),
                              }),
                              (0, p.jsx)(`td`, {
                                style: {
                                  padding: `13px 14px`,
                                  fontFamily: `var(--font-mono)`,
                                  fontSize: 13,
                                },
                                children: e.qty,
                              }),
                              (0, p.jsx)(`td`, {
                                style: {
                                  padding: `13px 14px`,
                                  fontFamily: `var(--font-mono)`,
                                  fontSize: 13,
                                },
                                children: y(e.buyPrice),
                              }),
                              (0, p.jsx)(`td`, {
                                style: {
                                  padding: `13px 14px`,
                                  fontFamily: `var(--font-mono)`,
                                  fontSize: 13,
                                },
                                children: y(e.cur),
                              }),
                              (0, p.jsx)(`td`, {
                                style: {
                                  padding: `13px 14px`,
                                  fontFamily: `var(--font-mono)`,
                                  fontSize: 13,
                                },
                                children: y(e.val),
                              }),
                              (0, p.jsxs)(`td`, {
                                style: {
                                  padding: `13px 14px`,
                                  fontFamily: `var(--font-mono)`,
                                  fontSize: 13,
                                  color:
                                    e.pnl >= 0 ? `var(--accent)` : `var(--red)`,
                                },
                                children: [
                                  e.pnl >= 0 ? `+` : ``,
                                  y(e.pnl),
                                  (0, p.jsx)(`br`, {}),
                                  (0, p.jsxs)(`span`, {
                                    style: { fontSize: 11 },
                                    children: [
                                      `(`,
                                      e.pnl >= 0 ? `+` : ``,
                                      e.pct.toFixed(2),
                                      `%)`,
                                    ],
                                  }),
                                ],
                              }),
                              (0, p.jsx)(`td`, {
                                style: { padding: `13px 14px` },
                                children: (0, p.jsx)(`button`, {
                                  onClick: () => d(e.symbol),
                                  style: {
                                    padding: `4px 10px`,
                                    borderRadius: 6,
                                    fontSize: 12,
                                    cursor: `pointer`,
                                    border: `1px solid var(--border)`,
                                    background: `transparent`,
                                    color: `var(--muted)`,
                                    fontFamily: `var(--font-sans)`,
                                  },
                                  onMouseEnter: (e) => {
                                    ((e.target.style.borderColor = `var(--red)`),
                                      (e.target.style.color = `var(--red)`));
                                  },
                                  onMouseLeave: (e) => {
                                    ((e.target.style.borderColor = `var(--border)`),
                                      (e.target.style.color = `var(--muted)`));
                                  },
                                  children: `Sell`,
                                }),
                              }),
                            ],
                          },
                          e.symbol,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
        ],
      }),
      (0, p.jsxs)(`div`, {
        style: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 16 },
        children: [
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `22px 24px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: { fontSize: 15, fontWeight: 500, marginBottom: 16 },
                children: `Market Pulse`,
              }),
              m.slice(0, 6).map((e) => {
                let t = n[e.symbol] || e.base,
                  r = (((t - e.base) / e.base) * 100).toFixed(2);
                return (0, p.jsxs)(
                  `div`,
                  {
                    style: {
                      display: `flex`,
                      justifyContent: `space-between`,
                      alignItems: `center`,
                      padding: `10px 0`,
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    },
                    children: [
                      (0, p.jsxs)(`div`, {
                        children: [
                          (0, p.jsx)(`div`, {
                            style: { fontSize: 13 },
                            children: e.name,
                          }),
                          (0, p.jsx)(`div`, {
                            style: {
                              fontSize: 11,
                              color: `var(--muted)`,
                              fontFamily: `var(--font-mono)`,
                            },
                            children: e.symbol,
                          }),
                        ],
                      }),
                      (0, p.jsxs)(`div`, {
                        style: { textAlign: `right` },
                        children: [
                          (0, p.jsx)(`div`, {
                            style: {
                              fontFamily: `var(--font-mono)`,
                              fontSize: 14,
                            },
                            children: y(t),
                          }),
                          (0, p.jsxs)(`div`, {
                            style: {
                              fontSize: 11,
                              fontFamily: `var(--font-mono)`,
                              color: r >= 0 ? `var(--accent)` : `var(--red)`,
                            },
                            children: [r >= 0 ? `+` : ``, r, `%`],
                          }),
                        ],
                      }),
                    ],
                  },
                  e.symbol,
                );
              }),
            ],
          }),
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `22px 24px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: { fontSize: 15, fontWeight: 500, marginBottom: 16 },
                children: `Indices`,
              }),
              [
                { name: `NIFTY 50`, val: `22,147.90`, chg: `+0.34%` },
                { name: `SENSEX`, val: `73,158.24`, chg: `+0.41%` },
                { name: `NIFTY BANK`, val: `46,732.15`, chg: `-0.12%` },
                { name: `NIFTY IT`, val: `32,481.35`, chg: `+1.02%` },
                { name: `NIFTY AUTO`, val: `19,204.65`, chg: `+0.67%` },
              ].map((e) =>
                (0, p.jsxs)(
                  `div`,
                  {
                    style: {
                      display: `flex`,
                      justifyContent: `space-between`,
                      alignItems: `center`,
                      padding: `10px 0`,
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    },
                    children: [
                      (0, p.jsx)(`div`, {
                        style: { fontSize: 13 },
                        children: e.name,
                      }),
                      (0, p.jsxs)(`div`, {
                        style: { textAlign: `right` },
                        children: [
                          (0, p.jsx)(`div`, {
                            style: {
                              fontFamily: `var(--font-mono)`,
                              fontSize: 14,
                            },
                            children: e.val,
                          }),
                          (0, p.jsx)(`div`, {
                            style: {
                              fontSize: 11,
                              fontFamily: `var(--font-mono)`,
                              color: e.chg.startsWith(`+`)
                                ? `var(--accent)`
                                : `var(--red)`,
                            },
                            children: e.chg,
                          }),
                        ],
                      }),
                    ],
                  },
                  e.name,
                ),
              ),
            ],
          }),
        ],
      }),
    ],
  });
}
function se({ user: e, setUser: t, prices: n, showToast: r }) {
  let [i, a] = (0, f.useState)(``),
    [o, s] = (0, f.useState)(`All`),
    [c, l] = (0, f.useState)(null),
    [u, d] = (0, f.useState)(1),
    g = m.filter(
      (e) =>
        (o === `All` || e.sector === o) &&
        (e.symbol.includes(i.toUpperCase()) ||
          e.name.toLowerCase().includes(i.toLowerCase())),
    ),
    _ = (t) => (e.portfolio || []).find((e) => e.symbol === t);
  return (0, p.jsxs)(`div`, {
    children: [
      (0, p.jsxs)(`div`, {
        style: { marginBottom: 28 },
        children: [
          (0, p.jsx)(`div`, {
            style: { fontFamily: `var(--font-serif)`, fontSize: 28 },
            children: `Search Stocks`,
          }),
          (0, p.jsx)(`div`, {
            style: { fontSize: 13, color: `var(--muted)`, marginTop: 3 },
            children: `Browse and buy from NSE-listed stocks`,
          }),
        ],
      }),
      (0, p.jsxs)(`div`, {
        style: { position: `relative`, marginBottom: 20 },
        children: [
          (0, p.jsxs)(`svg`, {
            style: {
              position: `absolute`,
              left: 16,
              top: `50%`,
              transform: `translateY(-50%)`,
              width: 18,
              height: 18,
              color: `var(--muted)`,
              stroke: `var(--muted)`,
            },
            viewBox: `0 0 20 20`,
            fill: `none`,
            strokeWidth: `1.6`,
            children: [
              (0, p.jsx)(`circle`, { cx: `9`, cy: `9`, r: `6` }),
              (0, p.jsx)(`line`, {
                x1: `13.5`,
                y1: `13.5`,
                x2: `18`,
                y2: `18`,
              }),
            ],
          }),
          (0, p.jsx)(`input`, {
            placeholder: `Search by name or symbol…`,
            value: i,
            onChange: (e) => a(e.target.value),
            style: {
              width: `100%`,
              padding: `14px 18px 14px 48px`,
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 12,
              color: `var(--text)`,
              fontFamily: `var(--font-sans)`,
              fontSize: 15,
              outline: `none`,
            },
            onFocus: (e) => (e.target.style.borderColor = `var(--accent)`),
            onBlur: (e) => (e.target.style.borderColor = `var(--border)`),
          }),
        ],
      }),
      (0, p.jsx)(`div`, {
        style: { display: `flex`, gap: 8, marginBottom: 24, flexWrap: `wrap` },
        children: h.map((e) =>
          (0, p.jsx)(
            `button`,
            {
              onClick: () => s(e),
              style: {
                padding: `6px 14px`,
                borderRadius: 20,
                border: `1px solid ${o === e ? `var(--accent)` : `var(--border)`}`,
                background: o === e ? `rgba(0,229,160,0.06)` : `transparent`,
                color: o === e ? `var(--accent)` : `var(--muted)`,
                fontSize: 12,
                fontFamily: `var(--font-sans)`,
                cursor: `pointer`,
                transition: `all .15s`,
              },
              children: e,
            },
            e,
          ),
        ),
      }),
      (0, p.jsx)(`div`, {
        style: {
          display: `grid`,
          gridTemplateColumns: `repeat(auto-fill,minmax(280px,1fr))`,
          gap: 16,
        },
        children: g.map((e) => {
          let t = n[e.symbol] || e.base,
            r = (((t - e.base) / e.base) * 100).toFixed(2),
            i = _(e.symbol),
            a = v(e.base);
          return (0, p.jsxs)(
            `div`,
            {
              style: {
                background: `var(--surface)`,
                border: `1px solid ${i ? `rgba(0,229,160,0.2)` : `var(--border)`}`,
                borderRadius: 14,
                padding: 20,
                transition: `border .2s,transform .15s`,
                cursor: `default`,
              },
              onMouseEnter: (e) => {
                ((e.currentTarget.style.borderColor = `rgba(0,229,160,0.3)`),
                  (e.currentTarget.style.transform = `translateY(-2px)`));
              },
              onMouseLeave: (e) => {
                ((e.currentTarget.style.borderColor = i
                  ? `rgba(0,229,160,0.2)`
                  : `var(--border)`),
                  (e.currentTarget.style.transform = `translateY(0)`));
              },
              children: [
                (0, p.jsxs)(`div`, {
                  style: {
                    display: `flex`,
                    justifyContent: `space-between`,
                    alignItems: `flex-start`,
                    marginBottom: 14,
                  },
                  children: [
                    (0, p.jsxs)(`div`, {
                      children: [
                        (0, p.jsx)(`div`, {
                          style: {
                            fontFamily: `var(--font-mono)`,
                            fontSize: 16,
                            fontWeight: 500,
                          },
                          children: e.symbol,
                        }),
                        (0, p.jsx)(`div`, {
                          style: {
                            fontSize: 12,
                            color: `var(--muted)`,
                            marginTop: 2,
                          },
                          children: e.name,
                        }),
                        i &&
                          (0, p.jsxs)(`span`, {
                            style: {
                              fontSize: 10,
                              background: `rgba(0,229,160,0.1)`,
                              color: `var(--accent)`,
                              padding: `2px 6px`,
                              borderRadius: 4,
                              marginTop: 4,
                              display: `inline-block`,
                            },
                            children: [`✓ `, i.qty, ` held`],
                          }),
                      ],
                    }),
                    (0, p.jsx)(`span`, {
                      style: {
                        padding: `3px 8px`,
                        borderRadius: 4,
                        fontSize: 11,
                        background: `rgba(124,106,255,0.12)`,
                        color: `var(--accent2)`,
                      },
                      children: e.sector,
                    }),
                  ],
                }),
                (0, p.jsx)(`div`, {
                  style: {
                    fontFamily: `var(--font-mono)`,
                    fontSize: 22,
                    marginBottom: 4,
                  },
                  children: y(t),
                }),
                (0, p.jsxs)(`div`, {
                  style: {
                    fontSize: 12,
                    fontFamily: `var(--font-mono)`,
                    color: r >= 0 ? `var(--accent)` : `var(--red)`,
                  },
                  children: [r >= 0 ? `▲ +` : `▼ `, Math.abs(r), `% today`],
                }),
                (0, p.jsx)(`div`, {
                  style: { margin: `12px 0` },
                  children: (0, p.jsx)(S, {
                    data: a,
                    color: r >= 0 ? `var(--accent)` : `var(--red)`,
                    height: 48,
                    fill: !1,
                  }),
                }),
                (0, p.jsxs)(`button`, {
                  onClick: () => {
                    (l(e), d(1));
                  },
                  style: {
                    width: `100%`,
                    padding: 8,
                    borderRadius: 8,
                    border: `none`,
                    background: `var(--accent)`,
                    color: `#0a0a0f`,
                    fontSize: 13,
                    fontFamily: `var(--font-sans)`,
                    fontWeight: 500,
                    cursor: `pointer`,
                  },
                  onMouseEnter: (e) => (e.target.style.opacity = `0.85`),
                  onMouseLeave: (e) => (e.target.style.opacity = `1`),
                  children: [`Buy `, e.symbol],
                }),
              ],
            },
            e.symbol,
          );
        }),
      }),
      c &&
        (0, p.jsx)(`div`, {
          onClick: () => l(null),
          style: {
            position: `fixed`,
            inset: 0,
            background: `rgba(0,0,0,0.7)`,
            display: `flex`,
            alignItems: `center`,
            justifyContent: `center`,
            zIndex: 200,
          },
          children: (0, p.jsxs)(`div`, {
            onClick: (e) => e.stopPropagation(),
            style: {
              background: `var(--bg2)`,
              border: `1px solid var(--border)`,
              borderRadius: 16,
              padding: 32,
              width: 400,
            },
            children: [
              (0, p.jsxs)(`h3`, {
                style: {
                  fontFamily: `var(--font-serif)`,
                  fontSize: 22,
                  marginBottom: 4,
                },
                children: [`Buy `, c.name],
              }),
              (0, p.jsxs)(`div`, {
                style: {
                  fontFamily: `var(--font-mono)`,
                  fontSize: 13,
                  color: `var(--muted)`,
                  marginBottom: 20,
                },
                children: [
                  c.symbol,
                  ` · `,
                  y(n[c.symbol] || c.base),
                  ` per share`,
                ],
              }),
              (0, p.jsxs)(`div`, {
                style: { marginBottom: 16 },
                children: [
                  (0, p.jsx)(`label`, {
                    style: {
                      display: `block`,
                      fontSize: 12,
                      color: `var(--muted)`,
                      marginBottom: 5,
                    },
                    children: `Quantity`,
                  }),
                  (0, p.jsx)(`input`, {
                    type: `number`,
                    min: `1`,
                    value: u,
                    onChange: (e) => d(+e.target.value),
                    style: {
                      width: `100%`,
                      padding: `10px 14px`,
                      background: `var(--surface)`,
                      border: `1px solid var(--border)`,
                      borderRadius: 8,
                      color: `var(--text)`,
                      fontFamily: `var(--font-sans)`,
                      fontSize: 14,
                      outline: `none`,
                    },
                    onFocus: (e) =>
                      (e.target.style.borderColor = `var(--accent)`),
                    onBlur: (e) =>
                      (e.target.style.borderColor = `var(--border)`),
                  }),
                ],
              }),
              (0, p.jsxs)(`div`, {
                style: {
                  fontSize: 12,
                  color: `var(--muted)`,
                  marginBottom: 16,
                  fontFamily: `var(--font-mono)`,
                },
                children: [
                  `Total cost: `,
                  (0, p.jsx)(`span`, {
                    style: { color: `var(--text)` },
                    children: y((n[c.symbol] || c.base) * u),
                  }),
                  ` · `,
                  `Balance after: `,
                  (0, p.jsx)(`span`, {
                    style: {
                      color:
                        e.balance - (n[c.symbol] || c.base) * u < 0
                          ? `var(--red)`
                          : `var(--accent)`,
                    },
                    children: y(
                      Math.max(0, e.balance - (n[c.symbol] || c.base) * u),
                    ),
                  }),
                ],
              }),
              (0, p.jsxs)(`div`, {
                style: { display: `flex`, gap: 10 },
                children: [
                  (0, p.jsx)(`button`, {
                    onClick: () => l(null),
                    style: {
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid var(--border)`,
                      background: `transparent`,
                      color: `var(--text)`,
                      fontSize: 14,
                      fontFamily: `var(--font-sans)`,
                      cursor: `pointer`,
                    },
                    children: `Cancel`,
                  }),
                  (0, p.jsx)(`button`, {
                    onClick: () => {
                      if (!c || u < 1) return;
                      let i = n[c.symbol] || c.base,
                        a = u * i;
                      if (a > e.balance) {
                        r(`Insufficient balance!`, `error`);
                        return;
                      }
                      let o = _(c.symbol),
                        s;
                      if (o) {
                        let t = o.qty + u,
                          n = (o.qty * o.buyPrice + u * i) / t;
                        s = e.portfolio.map((e) =>
                          e.symbol === c.symbol
                            ? { ...e, qty: t, buyPrice: +n.toFixed(2) }
                            : e,
                        );
                      } else
                        s = [
                          ...(e.portfolio || []),
                          {
                            symbol: c.symbol,
                            name: c.name,
                            qty: u,
                            buyPrice: +i.toFixed(2),
                            sector: c.sector,
                          },
                        ];
                      let f = { ...e, portfolio: s, balance: e.balance - a };
                      (b.updateUser(f),
                        t(f),
                        l(null),
                        d(1),
                        r(`Bought ${u} × ${c.symbol} for ${y(a)}`));
                    },
                    style: {
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: `none`,
                      background: `var(--accent)`,
                      color: `#0a0a0f`,
                      fontSize: 14,
                      fontFamily: `var(--font-sans)`,
                      fontWeight: 500,
                      cursor: `pointer`,
                    },
                    children: `Buy Now`,
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function ce({ user: e, prices: t }) {
  let n = e.portfolio || [];
  if (n.length === 0)
    return (0, p.jsxs)(`div`, {
      children: [
        (0, p.jsx)(`div`, {
          style: {
            fontFamily: `var(--font-serif)`,
            fontSize: 28,
            marginBottom: 4,
          },
          children: `Analytics`,
        }),
        (0, p.jsxs)(`div`, {
          style: {
            textAlign: `center`,
            padding: `80px 0`,
            color: `var(--muted)`,
          },
          children: [
            (0, p.jsx)(`div`, {
              style: { fontSize: 40, marginBottom: 12 },
              children: `📊`,
            }),
            (0, p.jsx)(`div`, {
              style: { fontSize: 16, marginBottom: 8 },
              children: `No holdings yet`,
            }),
            (0, p.jsx)(`div`, {
              style: { fontSize: 13 },
              children: `Buy some stocks to see your analytics`,
            }),
          ],
        }),
      ],
    });
  let r = n.map((e) => {
      let n = t[e.symbol] || e.buyPrice,
        r = e.qty * e.buyPrice,
        i = e.qty * n;
      return {
        ...e,
        cur: n,
        inv: r,
        val: i,
        pnl: i - r,
        pct: ((i - r) / r) * 100,
      };
    }),
    i = r.reduce((e, t) => e + t.val, 0),
    a = r.reduce((e, t) => e + t.inv, 0),
    o = i - a,
    s = new Set(n.map((e) => e.sector)).size,
    c =
      (r.filter((e) => e.sector === `IT`).reduce((e, t) => e + t.val, 0) / i) *
      100,
    l = (0.8 + Math.random() * 0.5).toFixed(2),
    u = {};
  r.forEach((e) => {
    u[e.sector] = (u[e.sector] || 0) + e.val;
  });
  let d = [
      `var(--accent)`,
      `var(--accent2)`,
      `var(--amber)`,
      `var(--red)`,
      `#38bdf8`,
      `#fb923c`,
    ],
    f = Array.from(
      { length: 20 },
      (e, t) => i * (0.82 + (t / 19) * 0.22 + (Math.random() - 0.5) * 0.03),
    ),
    m = r.map((e) => ({ label: e.symbol, value: e.pct })),
    h = [
      {
        name: `Portfolio concentration`,
        val: Math.min((r[0]?.val / i) * 100 || 0, 100),
        max: 100,
        color: `var(--red)`,
        note: `${((r[0]?.val / i) * 100 || 0).toFixed(0)}% in top stock`,
      },
      {
        name: `IT sector weight`,
        val: Math.min(c, 100),
        max: 100,
        color: c > 60 ? `var(--amber)` : `var(--accent)`,
        note: `${c.toFixed(0)}% of portfolio`,
      },
      {
        name: `Portfolio diversity`,
        val: Math.min((n.length / 15) * 100, 100),
        max: 100,
        color: `var(--accent2)`,
        note: `${n.length} of 15 stocks held`,
      },
      {
        name: `Cash ratio`,
        val: Math.min((e.balance / (i + e.balance)) * 100, 100),
        max: 100,
        color: `#38bdf8`,
        note: `${((e.balance / (i + e.balance)) * 100).toFixed(1)}% in cash`,
      },
    ];
  return (0, p.jsxs)(`div`, {
    children: [
      (0, p.jsx)(`div`, {
        style: {
          fontFamily: `var(--font-serif)`,
          fontSize: 28,
          marginBottom: 4,
        },
        children: `Analytics`,
      }),
      (0, p.jsx)(`div`, {
        style: { fontSize: 13, color: `var(--muted)`, marginBottom: 28 },
        children: `Deep dive into your portfolio performance`,
      }),
      (0, p.jsx)(`div`, {
        style: {
          display: `grid`,
          gridTemplateColumns: `repeat(4,1fr)`,
          gap: 16,
          marginBottom: 24,
        },
        children: [
          {
            label: `Total Return`,
            val: `${o >= 0 ? `+` : ``}${((o / a) * 100).toFixed(2)}%`,
            sub: o >= 0 ? `▲ Profit` : `▼ Loss`,
            up: o >= 0,
          },
          {
            label: `Unrealised P&L`,
            val: `${o >= 0 ? `+` : ``}${y(o)}`,
            sub: `on ${y(a)}`,
            up: o >= 0,
          },
          {
            label: `Diversification`,
            val: `${n.length} stocks`,
            sub: `${s} sectors`,
          },
          {
            label: `Portfolio Beta`,
            val: l,
            sub: l < 1 ? `Lower risk` : `Higher risk`,
          },
        ].map((e, t) =>
          (0, p.jsxs)(
            `div`,
            {
              style: {
                background: `var(--surface)`,
                border: `1px solid var(--border)`,
                borderRadius: 14,
                padding: `18px 20px`,
              },
              children: [
                (0, p.jsx)(`div`, {
                  style: {
                    fontSize: 11,
                    color: `var(--muted)`,
                    marginBottom: 6,
                    textTransform: `uppercase`,
                    letterSpacing: 1,
                  },
                  children: e.label,
                }),
                (0, p.jsx)(`div`, {
                  style: {
                    fontFamily: `var(--font-mono)`,
                    fontSize: 22,
                    fontWeight: 500,
                    color:
                      e.up === !0
                        ? `var(--accent)`
                        : e.up === !1
                          ? `var(--red)`
                          : `var(--text)`,
                  },
                  children: e.val,
                }),
                (0, p.jsx)(`div`, {
                  style: {
                    fontSize: 12,
                    marginTop: 4,
                    color: `var(--muted)`,
                    fontFamily: `var(--font-mono)`,
                  },
                  children: e.sub,
                }),
              ],
            },
            t,
          ),
        ),
      }),
      (0, p.jsxs)(`div`, {
        style: {
          display: `grid`,
          gridTemplateColumns: `2fr 1fr`,
          gap: 16,
          marginBottom: 24,
        },
        children: [
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `22px 24px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: { fontSize: 15, fontWeight: 500, marginBottom: 4 },
                children: `Portfolio Value Trend`,
              }),
              (0, p.jsx)(`div`, {
                style: {
                  fontSize: 12,
                  color: `var(--muted)`,
                  marginBottom: 16,
                },
                children: `20-day history`,
              }),
              (0, p.jsx)(S, {
                data: f,
                color: `var(--accent)`,
                height: 200,
                fill: !0,
              }),
            ],
          }),
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `22px 24px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: { fontSize: 15, fontWeight: 500, marginBottom: 4 },
                children: `Sector Allocation`,
              }),
              (0, p.jsx)(`div`, {
                style: {
                  fontSize: 12,
                  color: `var(--muted)`,
                  marginBottom: 16,
                },
                children: `Current portfolio weights`,
              }),
              (0, p.jsx)(`div`, {
                style: { display: `flex`, justifyContent: `center` },
                children: (0, p.jsx)(C, {
                  slices: Object.entries(u).map(([e, t], n) => ({
                    label: e,
                    value: t,
                    color: d[n % d.length],
                  })),
                  size: 160,
                }),
              }),
              (0, p.jsx)(`div`, {
                style: { marginTop: 12 },
                children: Object.entries(u).map(([e, t], n) =>
                  (0, p.jsxs)(
                    `div`,
                    {
                      style: {
                        display: `flex`,
                        justifyContent: `space-between`,
                        marginBottom: 4,
                      },
                      children: [
                        (0, p.jsxs)(`div`, {
                          style: {
                            display: `flex`,
                            alignItems: `center`,
                            gap: 6,
                          },
                          children: [
                            (0, p.jsx)(`div`, {
                              style: {
                                width: 8,
                                height: 8,
                                borderRadius: `50%`,
                                background: d[n % d.length],
                              },
                            }),
                            (0, p.jsx)(`span`, {
                              style: { fontSize: 12, color: `var(--muted)` },
                              children: e,
                            }),
                          ],
                        }),
                        (0, p.jsxs)(`span`, {
                          style: {
                            fontSize: 12,
                            fontFamily: `var(--font-mono)`,
                          },
                          children: [((t / i) * 100).toFixed(1), `%`],
                        }),
                      ],
                    },
                    e,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
      (0, p.jsxs)(`div`, {
        style: {
          display: `grid`,
          gridTemplateColumns: `1fr 1fr`,
          gap: 16,
          marginBottom: 24,
        },
        children: [
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `22px 24px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: { fontSize: 15, fontWeight: 500, marginBottom: 16 },
                children: `P&L by Stock`,
              }),
              (0, p.jsx)(te, { data: m }),
            ],
          }),
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `22px 24px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: { fontSize: 15, fontWeight: 500, marginBottom: 16 },
                children: `Top Movers`,
              }),
              [...r]
                .sort((e, t) => t.pct - e.pct)
                .map((e) =>
                  (0, p.jsxs)(
                    `div`,
                    {
                      style: {
                        display: `flex`,
                        justifyContent: `space-between`,
                        alignItems: `center`,
                        padding: `8px 0`,
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                      },
                      children: [
                        (0, p.jsxs)(`div`, {
                          children: [
                            (0, p.jsx)(`div`, {
                              style: {
                                fontFamily: `var(--font-mono)`,
                                fontSize: 13,
                              },
                              children: e.symbol,
                            }),
                            (0, p.jsx)(`div`, {
                              style: { fontSize: 11, color: `var(--muted)` },
                              children: e.name,
                            }),
                          ],
                        }),
                        (0, p.jsxs)(`div`, {
                          style: { textAlign: `right` },
                          children: [
                            (0, p.jsxs)(`div`, {
                              style: {
                                fontFamily: `var(--font-mono)`,
                                fontSize: 13,
                                color:
                                  e.pnl >= 0 ? `var(--accent)` : `var(--red)`,
                              },
                              children: [
                                e.pnl >= 0 ? `+` : ``,
                                e.pct.toFixed(2),
                                `%`,
                              ],
                            }),
                            (0, p.jsxs)(`div`, {
                              style: {
                                fontSize: 11,
                                color: `var(--muted)`,
                                fontFamily: `var(--font-mono)`,
                              },
                              children: [e.pnl >= 0 ? `+` : ``, y(e.pnl)],
                            }),
                          ],
                        }),
                      ],
                    },
                    e.symbol,
                  ),
                ),
            ],
          }),
        ],
      }),
      (0, p.jsxs)(`div`, {
        style: {
          background: `var(--surface)`,
          border: `1px solid var(--border)`,
          borderRadius: 14,
          padding: `22px 24px`,
        },
        children: [
          (0, p.jsx)(`div`, {
            style: { fontSize: 15, fontWeight: 500, marginBottom: 20 },
            children: `Risk Assessment`,
          }),
          (0, p.jsx)(`div`, {
            style: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 20 },
            children: h.map((e) =>
              (0, p.jsxs)(
                `div`,
                {
                  children: [
                    (0, p.jsxs)(`div`, {
                      style: {
                        display: `flex`,
                        justifyContent: `space-between`,
                        marginBottom: 6,
                      },
                      children: [
                        (0, p.jsx)(`span`, {
                          style: { fontSize: 13 },
                          children: e.name,
                        }),
                        (0, p.jsx)(`span`, {
                          style: {
                            fontSize: 12,
                            color: `var(--muted)`,
                            fontFamily: `var(--font-mono)`,
                          },
                          children: e.note,
                        }),
                      ],
                    }),
                    (0, p.jsx)(ne, {
                      value: e.val,
                      max: e.max,
                      color: e.color,
                    }),
                  ],
                },
                e.name,
              ),
            ),
          }),
        ],
      }),
    ],
  });
}
function le({ user: e, showToast: t }) {
  let [n, r] = (0, f.useState)({
      name: e?.name || ``,
      email: e?.email || ``,
      category: ``,
      subject: ``,
      message: ``,
    }),
    [i, a] = (0, f.useState)(!1),
    [o, s] = (0, f.useState)(!1),
    c = (() => {
      let e = new Date(),
        t = e.getDay(),
        n = e.getHours();
      return (
        (t >= 1 && t <= 5 && n >= 9 && n < 21) || (t === 6 && n >= 10 && n < 18)
      );
    })(),
    l = () => {
      if (!n.name || !n.email || !n.subject || !n.message) {
        t(`Please fill all required fields`, `error`);
        return;
      }
      (a(!0),
        setTimeout(() => {
          (a(!1),
            s(!0),
            r((e) => ({ ...e, category: ``, subject: ``, message: `` })),
            t(`Message sent! We'll get back within 24 hours.`),
            setTimeout(() => s(!1), 5e3));
        }, 1500));
    },
    u = (e, t, i = `text`, a = ``, o = !1) =>
      (0, p.jsxs)(`div`, {
        style: { marginBottom: 16 },
        children: [
          (0, p.jsxs)(`label`, {
            style: {
              display: `block`,
              fontSize: 12,
              color: `var(--muted)`,
              marginBottom: 5,
            },
            children: [e, o && ` *`],
          }),
          (0, p.jsx)(`input`, {
            type: i,
            placeholder: a,
            value: n[t],
            onChange: (e) => r((n) => ({ ...n, [t]: e.target.value })),
            style: {
              width: `100%`,
              padding: `10px 14px`,
              background: `var(--bg)`,
              border: `1px solid var(--border)`,
              borderRadius: 10,
              color: `var(--text)`,
              fontFamily: `var(--font-sans)`,
              fontSize: 14,
              outline: `none`,
            },
            onFocus: (e) => (e.target.style.borderColor = `var(--accent)`),
            onBlur: (e) => (e.target.style.borderColor = `var(--border)`),
          }),
        ],
      });
  return (0, p.jsxs)(`div`, {
    children: [
      (0, p.jsxs)(`div`, {
        style: { marginBottom: 32 },
        children: [
          (0, p.jsx)(`div`, {
            style: { fontFamily: `var(--font-serif)`, fontSize: 28 },
            children: `Contact Us`,
          }),
          (0, p.jsx)(`div`, {
            style: { fontSize: 13, color: `var(--muted)`, marginTop: 4 },
            children: `Get in touch with our support team — we're here to help.`,
          }),
        ],
      }),
      (0, p.jsxs)(`div`, {
        style: {
          display: `grid`,
          gridTemplateColumns: `1fr 1.6fr`,
          gap: 24,
          alignItems: `start`,
        },
        children: [
          (0, p.jsxs)(`div`, {
            style: { display: `flex`, flexDirection: `column`, gap: 16 },
            children: [
              (0, p.jsxs)(`div`, {
                style: {
                  background: `var(--surface)`,
                  border: `1px solid var(--border)`,
                  borderRadius: 14,
                  padding: `22px 24px`,
                },
                children: [
                  (0, p.jsx)(`div`, {
                    style: { fontSize: 15, fontWeight: 500, marginBottom: 16 },
                    children: `Reach us directly`,
                  }),
                  [
                    {
                      icon: (0, p.jsxs)(`svg`, {
                        viewBox: `0 0 24 24`,
                        fill: `none`,
                        stroke: `var(--accent)`,
                        strokeWidth: `2`,
                        strokeLinecap: `round`,
                        strokeLinejoin: `round`,
                        children: [
                          (0, p.jsx)(`path`, {
                            d: `M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7`,
                          }),
                          (0, p.jsx)(`rect`, {
                            x: `3`,
                            y: `5`,
                            width: `18`,
                            height: `14`,
                            rx: `2`,
                            strokeWidth: `2`,
                          }),
                        ],
                      }),
                      label: `Email Support`,
                      val: `support@stockvault.in`,
                    },
                    {
                      icon: (0, p.jsxs)(`svg`, {
                        viewBox: `0 0 24 24`,
                        fill: `none`,
                        stroke: `var(--accent)`,
                        strokeWidth: `2`,
                        strokeLinecap: `round`,
                        strokeLinejoin: `round`,
                        children: [
                          (0, p.jsx)(`path`, {
                            d: `M20 10C20 16 12 22 12 22C12 22 4 16 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10Z`,
                          }),
                          (0, p.jsx)(`circle`, { cx: `12`, cy: `10`, r: `3` }),
                        ],
                      }),
                      label: `Headquarters`,
                      val: `Greater Noida, India`,
                    },
                    {
                      icon: (0, p.jsx)(`svg`, {
                        viewBox: `0 0 24 24`,
                        fill: `none`,
                        stroke: `var(--accent)`,
                        strokeWidth: `2`,
                        strokeLinecap: `round`,
                        strokeLinejoin: `round`,
                        children: (0, p.jsx)(`path`, {
                          d: `M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z`,
                        }),
                      }),
                      label: `Phone`,
                      val: `+91 98765 43210`,
                    },
                  ].map((e, t) =>
                    (0, p.jsxs)(
                      `div`,
                      {
                        style: {
                          display: `flex`,
                          alignItems: `center`,
                          gap: 14,
                          padding: `12px 0`,
                          borderBottom:
                            t < 2 ? `1px solid rgba(255,255,255,0.04)` : `none`,
                        },
                        children: [
                          (0, p.jsx)(`div`, {
                            style: {
                              width: 38,
                              height: 38,
                              flexShrink: 0,
                              background: `rgba(0,229,160,0.1)`,
                              borderRadius: 10,
                              display: `flex`,
                              alignItems: `center`,
                              justifyContent: `center`,
                            },
                            children: (0, p.jsx)(`div`, {
                              style: { width: 18, height: 18 },
                              children: e.icon,
                            }),
                          }),
                          (0, p.jsxs)(`div`, {
                            children: [
                              (0, p.jsx)(`div`, {
                                style: {
                                  fontSize: 11,
                                  color: `var(--muted)`,
                                  marginBottom: 3,
                                },
                                children: e.label,
                              }),
                              (0, p.jsx)(`div`, {
                                style: {
                                  fontFamily: `var(--font-mono)`,
                                  fontSize: 14,
                                },
                                children: e.val,
                              }),
                            ],
                          }),
                        ],
                      },
                      t,
                    ),
                  ),
                ],
              }),
              (0, p.jsxs)(`div`, {
                style: {
                  background: `var(--surface)`,
                  border: `1px solid var(--border)`,
                  borderRadius: 14,
                  padding: `22px 24px`,
                },
                children: [
                  (0, p.jsx)(`div`, {
                    style: { fontSize: 15, fontWeight: 500, marginBottom: 16 },
                    children: `Support Hours`,
                  }),
                  [
                    [`Monday – Friday`, `9:00 AM – 9:00 PM`, null],
                    [`Saturday`, `10:00 AM – 6:00 PM`, null],
                    [`Sunday`, `Closed`, null],
                  ].map(([e, t], n) =>
                    (0, p.jsxs)(
                      `div`,
                      {
                        style: {
                          display: `flex`,
                          justifyContent: `space-between`,
                          alignItems: `center`,
                          padding: `10px 0`,
                          borderBottom:
                            n < 2 ? `1px solid rgba(255,255,255,0.04)` : `none`,
                          fontSize: 13,
                        },
                        children: [
                          (0, p.jsx)(`span`, {
                            style: { color: `var(--muted)` },
                            children: e,
                          }),
                          (0, p.jsx)(`span`, {
                            style: {
                              fontFamily: `var(--font-mono)`,
                              color:
                                e === `Sunday` ? `var(--muted)` : `var(--text)`,
                            },
                            children: t,
                          }),
                        ],
                      },
                      n,
                    ),
                  ),
                  (0, p.jsxs)(`div`, {
                    style: {
                      display: `flex`,
                      justifyContent: `space-between`,
                      alignItems: `center`,
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: `1px solid var(--border)`,
                    },
                    children: [
                      (0, p.jsx)(`span`, {
                        style: { fontSize: 13 },
                        children: `Current status`,
                      }),
                      (0, p.jsx)(`span`, {
                        style: {
                          background: c
                            ? `rgba(0,229,160,0.12)`
                            : `rgba(255,84,112,0.1)`,
                          color: c ? `var(--accent)` : `var(--red)`,
                          fontSize: 10,
                          padding: `2px 7px`,
                          borderRadius: 4,
                          fontFamily: `var(--font-mono)`,
                        },
                        children: c ? `OPEN` : `CLOSED`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, p.jsxs)(`div`, {
            style: {
              background: `var(--surface)`,
              border: `1px solid var(--border)`,
              borderRadius: 14,
              padding: `28px 30px`,
            },
            children: [
              (0, p.jsx)(`div`, {
                style: {
                  fontFamily: `var(--font-serif)`,
                  fontSize: 22,
                  marginBottom: 4,
                },
                children: `Send a message`,
              }),
              (0, p.jsx)(`div`, {
                style: {
                  fontSize: 13,
                  color: `var(--muted)`,
                  marginBottom: 24,
                },
                children: `Fill out the form and we'll get back to you within 24 hours.`,
              }),
              (0, p.jsxs)(`div`, {
                style: {
                  display: `grid`,
                  gridTemplateColumns: `1fr 1fr`,
                  gap: 14,
                },
                children: [
                  u(`Full Name`, `name`, `text`, `Rahul Sharma`, !0),
                  u(`Email Address`, `email`, `email`, `you@example.com`, !0),
                ],
              }),
              (0, p.jsxs)(`div`, {
                style: { marginBottom: 16 },
                children: [
                  (0, p.jsx)(`label`, {
                    style: {
                      display: `block`,
                      fontSize: 12,
                      color: `var(--muted)`,
                      marginBottom: 5,
                    },
                    children: `Category`,
                  }),
                  (0, p.jsxs)(`select`, {
                    value: n.category,
                    onChange: (e) =>
                      r((t) => ({ ...t, category: e.target.value })),
                    style: {
                      width: `100%`,
                      padding: `10px 14px`,
                      background: `var(--bg)`,
                      border: `1px solid var(--border)`,
                      borderRadius: 10,
                      color: n.category ? `var(--text)` : `var(--muted)`,
                      fontFamily: `var(--font-sans)`,
                      fontSize: 14,
                      outline: `none`,
                    },
                    onFocus: (e) =>
                      (e.target.style.borderColor = `var(--accent)`),
                    onBlur: (e) =>
                      (e.target.style.borderColor = `var(--border)`),
                    children: [
                      (0, p.jsx)(`option`, {
                        value: ``,
                        children: `-- Select a topic --`,
                      }),
                      (0, p.jsx)(`option`, {
                        value: `portfolio`,
                        children: `Portfolio / Holdings`,
                      }),
                      (0, p.jsx)(`option`, {
                        value: `account`,
                        children: `Account & Billing`,
                      }),
                      (0, p.jsx)(`option`, {
                        value: `bug`,
                        children: `Bug Report`,
                      }),
                      (0, p.jsx)(`option`, {
                        value: `feature`,
                        children: `Feature Request`,
                      }),
                      (0, p.jsx)(`option`, {
                        value: `other`,
                        children: `Other`,
                      }),
                    ],
                  }),
                ],
              }),
              u(
                `Subject *`,
                `subject`,
                `text`,
                `Briefly describe your issue`,
                !0,
              ),
              (0, p.jsxs)(`div`, {
                style: { marginBottom: 16 },
                children: [
                  (0, p.jsx)(`label`, {
                    style: {
                      display: `block`,
                      fontSize: 12,
                      color: `var(--muted)`,
                      marginBottom: 5,
                    },
                    children: `Message *`,
                  }),
                  (0, p.jsx)(`textarea`, {
                    placeholder: `Describe your issue in detail...`,
                    value: n.message,
                    onChange: (e) =>
                      r((t) => ({ ...t, message: e.target.value })),
                    rows: 5,
                    style: {
                      width: `100%`,
                      padding: `10px 14px`,
                      background: `var(--bg)`,
                      border: `1px solid var(--border)`,
                      borderRadius: 10,
                      color: `var(--text)`,
                      fontFamily: `var(--font-sans)`,
                      fontSize: 14,
                      outline: `none`,
                      resize: `vertical`,
                      minHeight: 110,
                    },
                    onFocus: (e) =>
                      (e.target.style.borderColor = `var(--accent)`),
                    onBlur: (e) =>
                      (e.target.style.borderColor = `var(--border)`),
                  }),
                ],
              }),
              (0, p.jsx)(`button`, {
                onClick: l,
                disabled: i,
                style: {
                  width: `100%`,
                  padding: 12,
                  background: `var(--accent)`,
                  color: `#0a0a0f`,
                  fontFamily: `var(--font-sans)`,
                  fontSize: 14,
                  fontWeight: 500,
                  border: `none`,
                  borderRadius: 10,
                  cursor: i ? `not-allowed` : `pointer`,
                  display: `flex`,
                  alignItems: `center`,
                  justifyContent: `center`,
                  gap: 8,
                  opacity: i ? 0.75 : 1,
                  transition: `opacity .2s`,
                },
                children: i
                  ? `Sending…`
                  : (0, p.jsxs)(p.Fragment, {
                      children: [
                        `Send Message `,
                        (0, p.jsxs)(`svg`, {
                          width: `16`,
                          height: `16`,
                          viewBox: `0 0 24 24`,
                          fill: `none`,
                          stroke: `currentColor`,
                          strokeWidth: `2.2`,
                          strokeLinecap: `round`,
                          strokeLinejoin: `round`,
                          children: [
                            (0, p.jsx)(`line`, {
                              x1: `22`,
                              y1: `2`,
                              x2: `11`,
                              y2: `13`,
                            }),
                            (0, p.jsx)(`polygon`, {
                              points: `22 2 15 22 11 13 2 9 22 2`,
                            }),
                          ],
                        }),
                      ],
                    }),
              }),
              o &&
                (0, p.jsxs)(`div`, {
                  style: {
                    background: `rgba(0,229,160,0.08)`,
                    border: `1px solid rgba(0,229,160,0.25)`,
                    borderRadius: 10,
                    padding: `14px 18px`,
                    fontSize: 13,
                    color: `var(--accent)`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 10,
                    marginTop: 16,
                  },
                  children: [
                    (0, p.jsxs)(`svg`, {
                      width: `18`,
                      height: `18`,
                      viewBox: `0 0 24 24`,
                      fill: `none`,
                      stroke: `currentColor`,
                      strokeWidth: `2.2`,
                      strokeLinecap: `round`,
                      strokeLinejoin: `round`,
                      children: [
                        (0, p.jsx)(`path`, {
                          d: `M22 11.08V12a10 10 0 11-5.93-9.14`,
                        }),
                        (0, p.jsx)(`polyline`, {
                          points: `22 4 12 14.01 9 11.01`,
                        }),
                      ],
                    }),
                    `Message sent! Our team will reach out within 24 hours.`,
                  ],
                }),
            ],
          }),
        ],
      }),
    ],
  });
}
var ue = {
  btnPrimary: {
    width: `100%`,
    padding: 14,
    background: `var(--accent)`,
    color: `#0a0a0f`,
    fontFamily: `var(--font-sans)`,
    fontSize: 15,
    fontWeight: 500,
    border: `none`,
    borderRadius: 10,
    cursor: `pointer`,
    marginTop: 8,
  },
};
function T() {
  let [e, t] = (0, f.useState)(() => b.getCurrent()),
    [n, r] = (0, f.useState)(`dashboard`),
    [i] = (0, f.useState)(() => _()),
    { toast: a, show: o } = x(),
    s = (e) => {
      (t(e), r(`dashboard`));
    },
    c = () => {
      (b.clearCurrent(), t(null), r(`dashboard`));
    },
    l = (e) => {
      t(e);
    };
  return e
    ? (0, p.jsxs)(`div`, {
        style: {
          ...E,
          display: `flex`,
          minHeight: `100vh`,
          background: `var(--bg)`,
          color: `var(--text)`,
          fontFamily: `var(--font-sans)`,
        },
        children: [
          (0, p.jsx)(w, { page: n, setPage: r, user: e, onLogout: c }),
          (0, p.jsxs)(`main`, {
            style: {
              marginLeft: 220,
              flex: 1,
              padding: `32px 36px`,
              animation: `fadeIn .3s ease`,
            },
            children: [
              n === `dashboard` &&
                (0, p.jsx)(oe, {
                  user: e,
                  setUser: l,
                  prices: i,
                  showToast: o,
                }),
              n === `search` &&
                (0, p.jsx)(se, {
                  user: e,
                  setUser: l,
                  prices: i,
                  showToast: o,
                }),
              n === `analytics` && (0, p.jsx)(ce, { user: e, prices: i }),
              n === `contact` && (0, p.jsx)(le, { user: e, showToast: o }),
            ],
          }),
          (0, p.jsx)(ee, { toast: a }),
          (0, p.jsx)(`style`, {
            children: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0a0a0f; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
        select option { background:#111118; }
      `,
          }),
        ],
      })
    : (0, p.jsxs)(`div`, {
        style: E,
        children: [
          (0, p.jsx)(ie, { onLogin: s }),
          (0, p.jsx)(ee, { toast: a }),
        ],
      });
}
var E = {
  "--bg": `#0a0a0f`,
  "--bg2": `#111118`,
  "--bg3": `#18181f`,
  "--surface": `#1e1e28`,
  "--border": `rgba(255,255,255,0.08)`,
  "--accent": `#00e5a0`,
  "--accent2": `#7c6aff`,
  "--red": `#ff5470`,
  "--amber": `#ffb547`,
  "--text": `#f0f0f5`,
  "--muted": `#8888aa`,
  "--font-serif": `'DM Serif Display', serif`,
  "--font-sans": `'DM Sans', sans-serif`,
  "--font-mono": `'DM Mono', monospace`,
};
(0, d.createRoot)(document.getElementById(`root`)).render(
  (0, p.jsx)(f.StrictMode, { children: (0, p.jsx)(T, {}) }),
);

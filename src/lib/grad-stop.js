!(function a(b, c, d) {
  function e(g, h) {
    if (!c[g]) {
      if (!b[g]) {
        const i = typeof require === 'function' && require

        if (!h && i) {
          return i(g, !0)
        }
        if (f) {
          return f(g, !0)
        }
        const j = new Error(`Cannot find module '${g}'`)

        throw ((j.code = 'MODULE_NOT_FOUND'), j)
      }
      const k = (c[g] = { exports: {} })

      b[g][0].call(
        k.exports,
        (a) => {
          const c = b[g][1][a]

          return e(c ? c : a)
        },
        k,
        k.exports,
        a,
        b,
        c,
        d,
      )
    }

    return c[g].exports
  }
  for (
    let f = typeof require === 'function' && require, g = 0;
    g < d.length;
    g++
  ) {
    e(d[g])
  }

  return e
})(
  {
    1: [
      (a, b, c) => {
        Object.defineProperty(c, '__esModule', { value: !0 })
        const d = {
          colorArray: ['#fff', '#000'],
          inputFormat: 'hex',
          stops: 5,
        }

        c.default = d
      },
      {},
    ],
    2: [
      function (a, b, c) {
        ((b) => {
          function c(a) {
            return a?.__esModule ? a : { default: a }
          }
          const d = (() => {
            function a(a, b) {
              const c = []
              let d = !0
              let e = !1
              let f = void 0

              try {
                for (
                  let g, h = a[Symbol.iterator]();
                  !(d = (g = h.next()).done)
                  && (c.push(g.value), !b || c.length !== b);
                  d = !0
                ) {}
              }
              catch (a) {
                (e = !0), (f = a)
              }
              finally {
                try {
                  !d && h.return && h.return()
                }
                finally {
                  if (e) {
                    throw f
                  }
                }
              }

              return c
            }

            return (b, c) => {
              if (Array.isArray(b)) {
                return b
              }
              if (Symbol.iterator in Object(b)) {
                return a(b, c)
              }
              throw new TypeError(
                'Invalid attempt to destructure non-iterable instance',
              )
            }
          })()
          const e = a('./polyfill')
          const f = a('./utils')
          const g = a('./defaultOptions')
          const h = c(g)

          !((a) => {
            function b(a) {
              if (
                ((a = (0, e.objectAssign)({}, this.options, a)),
                a.stops < a.colorArray.length)
              ) {
                throw 'Number of stops cannot be less than colorArray.length'
              }

              return this.computeStops(a)
            }
            (b.prototype.options = h.default),
            (b.prototype.computeStops = (a) => {
              const b = []
              const c = (a) => {
                switch (a.inputFormat) {
                  case 'hex':
                    return (0, f.extractHEX)(a.colorArray)
                  case 'rgb':
                    return (0, f.extractRGB)(a.colorArray)
                  case 'hsl':
                    return (0, f.extractHSL)(a.colorArray)
                }
              }
              const e = (a) => {
                for (
                  let c = a.colorArray, e = 1 / (a.stops - 1), g = 0, h = 0;
                  h < a.stops;
                  h++
                ) {
                  if (a.inputFormat === 'hex' || a.inputFormat === 'rgb') {
                    const i = (0, f.propBezInterpolate)(['r', 'g', 'b'])(c)(
                      g,
                    )
                    const j = d(i, 3)
                    const k = j[0]
                    const l = j[1]
                    const m = j[2]

                    b.push((0, f.returnRGBStr)([k, l, m]))
                  }
                  else if (a.inputFormat === 'hsl') {
                    const n = (0, f.propBezInterpolate)(['h', 's', 'l'])(c)(
                      g,
                    )
                    const o = d(n, 3)
                    const p = o[0]
                    const q = o[1]
                    const r = o[2]

                    b.push((0, f.returnHSLStr)([p, q, r]))
                  }
                  g += e
                }
              }

              return (a.colorArray = c(a)), e(a), b
            }),
            (a.gradStop = a => new b(a))
          })(typeof window !== 'undefined' ? window : b)
        }).call(
          this,
          typeof global !== 'undefined'
            ? global
            : typeof self !== 'undefined'
						  ? self
						  : typeof window !== 'undefined'
							  ? window
							  : {},
        )
      },
      {
        './defaultOptions': 1,
        './polyfill': 3,
        './utils': 4,
      },
    ],
    3: [
      (a, b, c) => {
        Object.defineProperty(c, '__esModule', { value: !0 });
        (c.mathTrunc = (() =>
          Math.trunc
            ? Math.trunc
            : a => (a === 0 ? a : a < 0 ? Math.ceil(a) : Math.floor(a)))()),
        (c.objectAssign = (() =>
          Object.assign
            ? Object.assign
            : (a) => {
                if (void 0 === a || a === null) {
                  throw new TypeError(
                    'Cannot convert undefined or null to object',
                  )
                }
                for (let b = Object(a), c = 1; c < arguments.length; c++) {
                  const d = arguments[c]

                  if (void 0 !== d && d !== null) {
                    for (const e in d) {
                      d.hasOwnProperty(e) && (b[e] = d[e])
                    }
                  }
                }

                return b
							  })())
      },
      {},
    ],
    4: [
      (a, b, c) => {
        Object.defineProperty(c, '__esModule', { value: !0 }),
        (c.returnHSLStr
						= c.returnRGBStr
						= c.extractHSL
						= c.extractRGB
						= c.extractHEX
						= c.propBezInterpolate
							= void 0)
        const d = (() => {
          function a(a, b) {
            const c = []
            let d = !0
            let e = !1
            let f = void 0

            try {
              for (
                let g, h = a[Symbol.iterator]();
                !(d = (g = h.next()).done)
                && (c.push(g.value), !b || c.length !== b);
                d = !0
              ) {}
            }
            catch (a) {
              (e = !0), (f = a)
            }
            finally {
              try {
                !d && h.return && h.return()
              }
              finally {
                if (e) {
                  throw f
                }
              }
            }

            return c
          }

          return (b, c) => {
            if (Array.isArray(b)) {
              return b
            }
            if (Symbol.iterator in Object(b)) {
              return a(b, c)
            }
            throw new TypeError(
              'Invalid attempt to destructure non-iterable instance',
            )
          }
        })()
        const e = a('./polyfill')
        const f = (a) => {
          const b = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a)
          const c = b.map(a => parseInt(a, 16))
          const e = d(c, 4)
          const f = e[1]
          const g = e[2]
          const h = e[3]

          return {
            b: h,
            g: g,
            r: f,
          }
        }
        const g = (a, b, c) => a.split('').slice(b, c).join('')
        const h = a =>
          a.map(a =>
            a.length === 4
              ? `#${a[1]}${a[1]}${a[2]}${a[2]}${a[3]}${a[3]}`
              : a.length === 7
							  ? a
							  : void 0,
          );
        (c.propBezInterpolate = a => b => (c) => {
          const d = 1 - c
          let f = void 0

          return a.map(
            a =>
              b.length === 2
                ? (f = d * b[0][a] + c * b[1][a])
                : b.length === 3
								  ? (f
											= d ** 2 * b[0][a] + 2 * d * c * b[1][a] + c ** 2 * b[2][a])
								  : b.length === 4
								  && (f
											= d ** 3 * b[0][a]
											+ 3 * d ** 2 * c * b[1][a]
											+ 3 * d * c ** 2 * b[2][a]
											+ c ** 3 * b[3][a]),
            (0, e.mathTrunc)(f),
          )
        }),
        (c.extractHEX = a => h(a).map(a => f(a))),
        (c.extractRGB = a =>
          a.map((a) => {
            const b = g(a, 4, -1).split(',')
            const c = d(b, 3)
            const e = c[0]
            const f = c[1]
            const h = c[2]

            return {
              b: h,
              g: f,
              r: e,
            }
          })),
        (c.extractHSL = a =>
          a.map((a) => {
            a = g(a, 4, -1).split(',')
            const b = a[0]
            const c = g(a[1], 0, -1)
            const d = g(a[2], 0, -1)

            return {
              h: b,
              l: d,
              s: c,
            }
          })),
        (c.returnRGBStr = a => `rgb(${a[0]}, ${a[1]}, ${a[2]})`),
        (c.returnHSLStr = a => `hsl(${a[0]}, ${a[1]}%, ${a[2]}%)`)
      },
      { './polyfill': 3 },
    ],
  },
  {},
  [1, 2, 3, 4],
)

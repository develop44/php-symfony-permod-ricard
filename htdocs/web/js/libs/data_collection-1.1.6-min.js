Array.prototype.indexOfAny = function (array) {
    return this.findIndex(function(v) { return array.indexOf(v) != -1; });
}

Array.prototype.containsAny = function (array) {
    return this.indexOfAny(array) != -1;
}

! function(v) {
    function k(a) {
        this.__instance = this.__index = null;
        this.__map = Object.create(null);
        this.load(a)
    }

    function g(a, b) {
        this.__parent = a;
        this.__parentInstance = a.__instance;
        this._data = b
    }
    k.prototype.__instances = 0;
    k.prototype.__increment__ = function() {
        this.__instance = this.constructor.prototype.__instances++
    };
    k.prototype.__uniqid__ = function() {
        return this.__uniqid++
    };
    k.prototype.__find__ = function(a) {
        var b = this._data,
            d = b.length;
        if (b[d >>> 1] === a) return d >>> 1;
        for (var c = 0; c < d >>> 1; c++) {
            if (b[c] === a) return c;
            if (b[d -
                c - 1] === a) return d - c - 1
        }
        return -1
    };
    k.prototype.__prepare__ = function(a) {
        var b = Array(a.length),
            d = 0,
            c, e = [],
            f, h, n = this.__index,
            g = this.__indexedRows,
            k = this.__map,
            r = [],
            t;
        a.length && "object" === typeof a[0] && null !== a[0] && Object.keys(a[0]);
        r = Object.keys(this.__map);
        t = r.length;
        if (n)
            for (l = 0, q = a.length; l < q; l++) {
                if ((c = a[l]) && "object" === typeof c) {
                    p = g[c[n]] || (b[d++] = Object.defineProperty(Object.create(null), "__uniqid__", {
                            value: this.__uniqid__()
                        }));
                    e = Object.keys(c);
                    h = e.length;
                    for (m = 0; m < h; m++) f = e[m], p[f] = c[f];
                    for (m = 0; m <
                    t; m++) c = r[m], p[c] = k[c].call(this, p);
                    g[p[n]] = p
                }
            } else
            for (var l = 0, q = a.length; l < q; l++)
                if ((c = a[l]) && "object" === typeof c) {
                    var p = Object.defineProperty(Object.create(null), "__uniqid__", {
                            value: this.__uniqid__()
                        }),
                        e = Object.keys(c);
                    h = e.length;
                    for (var m = 0; m < h; m++) f = e[m], p[f] = c[f];
                    for (m = 0; m < t; m++) c = r[m], p[c] = k[c].call(this, p);
                    b[d++] = p
                }
        return b = b.slice(0, d)
    };
    k.prototype.defineIndex = function(a) {
        if ("string" !== typeof a) throw Error("Must have a valid string as an index parameter");
        this.__index = a + "";
        for (var b = Object.create(null),
                 d = this._data, c = 0, e = d.length; c < e; c++) b[d[c][a]] = d[c];
        this.__indexedRows = b;
        return this
    };
    k.prototype.removeIndex = function() {
        this.__index = null;
        this.__indexedRows = Object.create(null)
    };
    k.prototype.createMapping = function(a, b) {
        if ("string" !== typeof a) throw Error("Must have a valid string as an key parameter for mapping");
        if ("function" !== typeof b) throw Error("Mapping function must be a valid function");
        this.__map[a] = b;
        for (var d = this._data, c = 0, e = d.length; c < e; c++) {
            var f = d[c];
            f[a] = b.call(this, f)
        }
        return this
    };
    k.prototype.exists = function(a) {
        return !!this.fetch(a)
    };
    k.prototype.fetch = function(a) {
        if (null === this.__index) throw Error("No index defined on DataCollection");
        return this.__indexedRows[a] || null
    };
    k.prototype.destroy = function(a) {
        if (null === this.__index) throw Error("No index defined on DataCollection");
        var b = this.__indexedRows[a];
        if (!b) throw Error("Can not destroy, index does not exist");
        this.__find__(b);
        this._data.splice(this.__find__(b), 1);
        delete this.__indexedRows[a];
        this.__increment__();
        return b
    };
    k.prototype.__remove__ =
        function(a) {
            var b = this._data,
                d = -1,
                c = this.__index,
                e = {},
                f = Array(b.length - a);
            if (null === c)
                for (var h = 0, n = b.length; h < n; h++) a = b[h], a.__remove__ || (f[++d] = a);
            else {
                h = 0;
                for (n = b.length; h < n; h++) a = b[h], a.__remove__ || (f[++d] = a, e[a[c]] = a);
                this.__indexedRows = e
            }
            this._data = f;
            this.__increment__();
            return !0
        };
    k.prototype.insert = function(a) {
        a instanceof Array || (a = [].slice.call(arguments));
        this._data = this._data.concat(this.__prepare__(a));
        this.__increment__();
        return !0
    };
    k.prototype.load = function(a) {
        a instanceof Array || (a = [].slice.call(arguments));
        this.__indexedRows = Object.create(null);
        this.__uniqid = 0;
        this._data = this.__prepare__(a);
        this.__increment__();
        return !0
    };
    k.prototype.truncate = function(a) {
        this.__indexedRows = Object.create(null);
        this.__uniqid = 0;
        this._data = [];
        this.__increment__();
        return !0
    };
    k.prototype.query = function() {
        return new g(this, this._data.slice())
    };
    g.prototype.__validate__ = function() {
        if (null !== this.__parent && this.__parent.__instance !== this.__parentInstance) throw Error("Invalid DataCollection query, parent has been modified");
    };
    g.prototype.__compare = {
        is: function(a, b) {
            return a === b
        },
        not: function(a, b) {
            return a !== b
        },
        gt: function(a, b) {
            return a > b
        },
        lt: function(a, b) {
            return a < b
        },
        gte: function(a, b) {
            return a >= b
        },
        lte: function(a, b) {
            return a <= b
        },
        icontains: function(a, b) {
            return -1 < a.toLowerCase().indexOf(b.toLowerCase())
        },
        startsWith: function(a, b) {
            return a.toLowerCase().startsWith(b.toLowerCase())
        },
        contains: function(a, b) {
            return -1 < a.indexOf(b)
        },
        "in": function(a, b) {
            return -1 < b.indexOf(a)
        },
        not_in: function(a, b) {
            return -1 === b.indexOf(a)
        },
        in_array: function (a, b) {
            return -1 < b.indexOf(a)
        },
        array_contains: function (a, b) {
            return a.indexOf(b) > -1
        },
        array_not_contains: function (a, b) {
            return a.indexOf(b) <= -1
        },
        array_contains_any: function (a, b) {
            return a.containsAny(b)
        },
        array_not_contains_any: function (a, b) {
            return !a.containsAny(b)
        }
    };
    g.prototype.__filter = function(a, b) {
        this.__validate__();
        b = !!b;
        for (var d = 0, c = a.length; d <
        c; d++)
            if ("object" !== typeof a[d] || null === a[d]) a[d] = {};
        a.length || (a = [{}]);
        var e = this._data.slice(),
            f, h, n, k, s, r, t = a.length,
            l, q, p;
        for (l = 0; l !== t; l++) {
            f = a[l];
            h = Object.keys(f);
            k = [];
            d = 0;
            for (c = h.length; d < c; d++) {
                n = h[d];
                s = n.split("__");
                2 > s.length && s.push("is");
                r = s.pop();
                if (!this.__compare[r]) throw Error('Filter type "' + r + '" not supported.');
                k.push([this.__compare[r], s, f[n]])
            }
            a[l] = k
        }
        var m, y, z, x, A, c = e.length,
            u;
        f = 0;
        h = Array(c);
        s = 0;
        var w;
        try {
            for (d = 0; d !== c; d++)
                for (x = e[d], u = !0, q = 0; q !== t && u; q++) {
                    u = !1;
                    k = a[q];
                    A = k.length;
                    for (p = 0; p !== A && !u; p++) {
                        m = k[p];
                        y = m[0];
                        w = x;
                        n = m[1];
                        l = 0;
                        for (s = n.length; l !== s; l++) w = w[n[l]];
                        z = m[2];
                        y(w, z) === b && (u = !0)
                    }!u && (h[f++] = x)
                }
        } catch (v) {
            throw Error("Nested field " + n.join("__") + " does not exist");
        }
        h = h.slice(0, f);
        return new g(this.__parent, h)
    };
    g.prototype.filter = function(a) {
        var b = [].slice.call(arguments);
        return this.__filter(b, !1)
    };
    g.prototype.exclude = function(a) {
        var b = [].slice.call(arguments);
        return this.__filter(b, !0)
    };
    g.prototype.spawn = function(a) {
        this.__validate__();
        var b = new k(this._data);
        if (a) return b;
        this.__parent.__index && b.defineIndex(this.__parent.__index);
        return b
    };
    g.prototype.each = function(a) {
        if ("function" !== typeof a) throw Error("DataCollectionQuery.each expects a callback");
        for (var b = this._data, d = 0, c = b.length; d < c; d++) a.call(this, b[d], d);
        return this
    };
    g.prototype.update = function(a) {
        this.__validate__();
        for (var b = Object.keys(a), d, c = b.length, e = 0; e < c; e++) d = b[e], b[e] = [d, a[d]];
        a = this._data;
        for (var e = 0, f = a.length; e < f; e++)
            for (var h = a[e], n = 0; n < c; n++) d = b[n], h[d[0]] = d[1];
        return this
    };
    g.prototype.remove =
        function() {
            this.__validate__();
            this.update({
                __remove__: !0
            });
            return this.__parent.__remove__(this.count())
        };
    g.prototype.order = function(a, b) {
        this.__validate__();
        var d = a = (a + "").replace(/[^A-Za-z0-9-_]/gi, "?");
        a = "['" + a.split("__").join("']['") + "']";
        var c = new Function("a", "b", ["var val = " + (b ? -1 : 1) + ";", "var a__uniq = a.__uniqid__\nvar b__uniq = b.__uniqid__", "a = a" + a + ";", "b = b" + a + ";", "if(a === b) { return a__uniq > b__uniq ? (val) : -(val); }\nif(a === undefined) { return 1; }\nif(b === undefined) { return -1; }\nif(a === null) { return 1; }\nif(b === null) { return -1; }\nif(typeof a === 'function') {\n  if(typeof b === 'function') { return a__uniq > b__uniq ? (val) : -(val); }\n  return -1;\n}\nif(typeof a === 'object') {\n  if(typeof b === 'function') { return 1; }\n  if(typeof b === 'object') {\n    if(a instanceof Date && b instanceof Date) {\n        return a.valueOf() > b.valueOf() ? (val) : -(val);\n    }\n    if(a instanceof Date) { return 1; }\n    if(b instanceof Date) { return -1; }\n    return a__uniq > b__uniq ? (val) : -(val);\n  }\n  return -1;\n}\nif(typeof a === 'string') {\n  if(typeof b === 'function') { return 1; }\n  if(typeof b === 'object') { return 1; }\n  if(typeof b === 'string') { return a > b ? (val) : -(val); }\n  return -1;\n}\nif(typeof a === 'boolean') {\n  if(typeof b === 'boolean') { return a > b ? (val) : -(val); }\n  if(typeof b === 'number') { return -1; }\n  return 1;\n}\nif(typeof a === 'number') {\n  if(typeof b === 'number') {\n    if(isNaN(a) && isNaN(b)) { return a__uniq > b__uniq ? (val) : -(val); }\n    if(isNaN(a)) { return 1; }\n    if(isNaN(b)) { return -1; }\n    return a > b ? (val) : -(val);\n  }\n  return 1;\n}\nreturn a__uniq > b__uniq ? (val) : -(val);"].join("\n"));
        try {
            var e = this._data.slice().sort(c)
        } catch (f) {
            throw Error("Key " + d + " could not be sorted by");
        }
        return new g(this.__parent, e)
    };
    g.prototype.sort = g.prototype.order;
    g.prototype.values = function(a) {
        this.__validate__();
        if (!a) return this._data.slice();
        for (var b = this._data, d = b.length, c = Array(d), e = 0; e < d; e++) c[e] = b[e][a];
        return c
    };
    g.prototype.max = function(a) {
        this.__validate__();
        var b = this._data,
            d = b.length,
            c = null,
            e;
        if (!d) return 0;
        for (var c = b[0][a], f = 1; f < d; f++) e = b[f][a], e > c && (c = e);
        return c
    };
    g.prototype.min = function(a) {
        this.__validate__();
        var b = this._data,
            d = b.length,
            c = null,
            e;
        if (!d) return 0;
        for (var c = b[0][a], f = 1; f < d; f++) e = b[f][a], e < c && (c = e);
        return c
    };
    g.prototype.sum = function(a) {
        this.__validate__();
        var b = this._data,
            d = b.length,
            c;
        if (!d) return 0;
        c = parseFloat(b[0][a]);
        for (var e = 1; e < d && !isNaN(c); e++) c += parseFloat(b[e][a]);
        return c
    };
    g.prototype.avg = function(a) {
        this.__validate__();
        var b = this._data,
            d = b.length,
            c;
        if (!d) return 0;
        c = parseFloat(b[0][a]);
        for (var e = 1; e < d && !isNaN(c); e++) c += parseFloat(b[e][a]);
        return c / d
    };
    g.prototype.reduce = function(a,
                                  b) {
        this.__validate__();
        var d = this._data,
            c = d.length,
            e, f;
        if (!c) return null;
        f = d[0][a];
        for (var h = 1; h < c; h++) e = d[h][a], f = b.call(this, f, e, h);
        return f
    };
    g.prototype.distinct = function(a) {
        this.__validate__();
        var b = this._data,
            d = b.length,
            c = Object.create(null),
            e;
        if (d) {
            c[b[0][a] + "__" + typeof b[0][a]] = !0;
            for (var f = 1; f < d; f++) e = b[f][a] + "__" + typeof b[f][a], c[e] || (c[e] = !0)
        }
        a = Object.keys(c);
        e = {
            undefined: function(a) {},
            number: function(a) {
                return Number(a)
            },
            string: function(a) {
                return a
            },
            "boolean": function(a) {
                return {
                    "true": !0,
                    "false": !1
                }[a]
            },
            object: function(a) {
                return "null" === a ? null : Object.create(null)
            },
            "function": function(a) {
                return function() {}
            }
        };
        f = 0;
        for (d = a.length; f < d; f++) b = a[f].split("__"), c = b.pop(), a[f] = e[c](b.join("__"));
        return a.sort(function(a, b) {
            return a === b ? 0 : void 0 === a ? 1 : void 0 === b ? -1 : null === a ? 1 : null === b ? -1 : "function" === typeof a ? "function" === typeof b ? 0 : -1 : "object" === typeof a ? "function" === typeof b ? 1 : "object" === typeof b ? 0 : -1 : "string" === typeof a ? "function" === typeof b || "object" === typeof b ? 1 : "string" === typeof b ? a >
            b ? 1 : -1 : -1 : "boolean" === typeof a ? "boolean" === typeof b ? a > b ? 1 : -1 : "number" === typeof b ? -1 : 1 : "number" === typeof b ? isNaN(a) && isNaN(b) ? 0 : isNaN(a) ? 1 : isNaN(b) ? -1 : a > b ? 1 : -1 : 1
        })
    };
    g.prototype.sequence = function(a) {
        this.__validate__();
        var b = this.__parent;
        if (!b.__index) throw Error("Can only use .sequence with an indexed DataCollection");
        a instanceof Array || (a = [].slice.call(arguments));
        for (var d = [], c = b.__indexedRows, e = 0, f = a.length; e < f; e++) b = a[e], c[b] && d.push(c[b]);
        return new g(this.__parent, d)
    };
    g.prototype.limit = function(a,
                                 b) {
        this.__validate__();
        "undefined" === typeof b && (b = a, a = 0);
        return new g(this.__parent, this._data.slice(a, a + b))
    };
    g.prototype.count = function() {
        this.__validate__();
        return this._data.length
    };
    g.prototype.first = function() {
        return this._data.length ? this._data[0] : null
    };
    g.prototype.last = function() {
        return this._data.length ? this._data[this._data.length - 1] : null
    };
    g.prototype.transform = function(a) {
        if ("object" !== typeof a || null === a) throw Error("keyMapPairs must be valid object");
        var b = Object.keys(a),
            d, c = {},
            e = {},
            f;
        f =
            0;
        for (klen = b.length; f < klen; f++)
            if (d = b[f], "string" === typeof a[d]) e[d] = a[d];
            else if ("function" === typeof a[d]) c[d] = a[d];
            else throw Error("keyMapPairs can only contain functions or strings");
        var b = Object.keys(e),
            h = Object.keys(c),
            k = b.length,
            v = h.length,
            s = this._data,
            r = s.length,
            t = Array(r),
            l, q;
        for (a = 0; a < r; a++) {
            l = s[a];
            q = Object.create(null);
            f = 0;
            for (klen = k; f < klen; f++) d = b[f], q[d] = l[e[d]];
            f = 0;
            for (klen = v; f < klen; f++) d = h[f], q[d] = c[d].call(this, l);
            t[a] = q
        }
        return new g(this.__parent, t)
    };
    g.prototype.json = function(a) {
        return JSON.stringify(this.values(a))
    };
    v.DataCollection = k
}(window);

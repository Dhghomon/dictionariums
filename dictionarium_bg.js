import * as wasm from './dictionarium_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_24(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha08a6456dba3bb2b(arg0, arg1);
}

function __wbg_adapter_27(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h446515851bb23b7d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_30(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h446515851bb23b7d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_33(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h446515851bb23b7d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_36(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h446515851bb23b7d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_39(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h6a9e82da3cffedd9(arg0, arg1);
}

function __wbg_adapter_42(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h446515851bb23b7d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_45(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h446515851bb23b7d(arg0, arg1, addHeapObject(arg2));
}

/**
* This is the entry-point for all the web-assembly.
* This is called once from the HTML.
* It loads the app, installs some callbacks, then returns.
* You can add more callbacks like this if you want to call in to your code.
* @param {string} canvas_id
*/
export function start(canvas_id) {
    var ptr0 = passStringToWasm0(canvas_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.start(ptr0, len0);
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_new(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    var ret = false;
    return ret;
};

export function __wbg_instanceof_WebGl2RenderingContext_acac10ed74c696cb(arg0) {
    var ret = getObject(arg0) instanceof WebGL2RenderingContext;
    return ret;
};

export function __wbg_drawingBufferWidth_88ef8b0a2794d701(arg0) {
    var ret = getObject(arg0).drawingBufferWidth;
    return ret;
};

export function __wbg_drawingBufferHeight_14333bdf86372817(arg0) {
    var ret = getObject(arg0).drawingBufferHeight;
    return ret;
};

export function __wbg_bufferData_80963d2bd1ecb1bc(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
};

export function __wbg_texImage2D_a5dad82b8f689bbd() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9 === 0 ? undefined : getArrayU8FromWasm0(arg9, arg10));
}, arguments) };

export function __wbg_activeTexture_32edab6336bd38a9(arg0, arg1) {
    getObject(arg0).activeTexture(arg1 >>> 0);
};

export function __wbg_attachShader_5d53b7b00823cafb(arg0, arg1, arg2) {
    getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
};

export function __wbg_bindBuffer_4a7874f09df12419(arg0, arg1, arg2) {
    getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindTexture_d659843380f373b5(arg0, arg1, arg2) {
    getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
};

export function __wbg_blendFunc_8bd5998b54c12fd3(arg0, arg1, arg2) {
    getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_clear_25e035ed3961f1c6(arg0, arg1) {
    getObject(arg0).clear(arg1 >>> 0);
};

export function __wbg_clearColor_fc22409197a5bd68(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
};

export function __wbg_compileShader_f7e245515fa1405d(arg0, arg1) {
    getObject(arg0).compileShader(getObject(arg1));
};

export function __wbg_createBuffer_4302ddbcbfc99048(arg0) {
    var ret = getObject(arg0).createBuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createProgram_128698dd90ec070d(arg0) {
    var ret = getObject(arg0).createProgram();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createShader_26e4f959d5d64d80(arg0, arg1) {
    var ret = getObject(arg0).createShader(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createTexture_8ba2e566eb313fcf(arg0) {
    var ret = getObject(arg0).createTexture();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_disable_827be6d0f77447e1(arg0, arg1) {
    getObject(arg0).disable(arg1 >>> 0);
};

export function __wbg_drawElements_c109bfea7998fd99(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
};

export function __wbg_enable_65590f4951fd0112(arg0, arg1) {
    getObject(arg0).enable(arg1 >>> 0);
};

export function __wbg_enableVertexAttribArray_413ef49912a23f9e(arg0, arg1) {
    getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
};

export function __wbg_getAttribLocation_422da253e02c78ac(arg0, arg1, arg2, arg3) {
    var ret = getObject(arg0).getAttribLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return ret;
};

export function __wbg_getProgramInfoLog_f8f65be65281f691(arg0, arg1, arg2) {
    var ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_getProgramParameter_b949ba1d9662f6a2(arg0, arg1, arg2) {
    var ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getShaderInfoLog_5412e8bc642139e8(arg0, arg1, arg2) {
    var ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_getShaderParameter_cced0ff8ba83f3e7(arg0, arg1, arg2) {
    var ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getUniformLocation_472b7459010900a5(arg0, arg1, arg2, arg3) {
    var ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_linkProgram_370ed11b34456c89(arg0, arg1) {
    getObject(arg0).linkProgram(getObject(arg1));
};

export function __wbg_pixelStorei_d2b5d30ea97fc3ba(arg0, arg1, arg2) {
    getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
};

export function __wbg_scissor_1f78ef0050a93516(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).scissor(arg1, arg2, arg3, arg4);
};

export function __wbg_shaderSource_96ace5133c032f2f(arg0, arg1, arg2, arg3) {
    getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
};

export function __wbg_texParameteri_c0b2b665319f6a16(arg0, arg1, arg2, arg3) {
    getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
};

export function __wbg_uniform1i_a1e8f5ad954fa6b5(arg0, arg1, arg2) {
    getObject(arg0).uniform1i(getObject(arg1), arg2);
};

export function __wbg_uniform2f_ab7c909be2949448(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform2f(getObject(arg1), arg2, arg3);
};

export function __wbg_useProgram_b1cc885b00b8f52c(arg0, arg1) {
    getObject(arg0).useProgram(getObject(arg1));
};

export function __wbg_vertexAttribPointer_3bb013e284cd07bf(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
};

export function __wbg_viewport_86b156d5858adab9(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).viewport(arg1, arg2, arg3, arg4);
};

export function __wbg_instanceof_Window_fa4595281eb5ba83(arg0) {
    var ret = getObject(arg0) instanceof Window;
    return ret;
};

export function __wbg_document_d8cce4c1031c64eb(arg0) {
    var ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_location_f8de588551329bf4(arg0) {
    var ret = getObject(arg0).location;
    return addHeapObject(ret);
};

export function __wbg_navigator_fbf745329c64378b(arg0) {
    var ret = getObject(arg0).navigator;
    return addHeapObject(ret);
};

export function __wbg_innerWidth_aab6ec3242dff39e() { return handleError(function (arg0) {
    var ret = getObject(arg0).innerWidth;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_innerHeight_7e514d9823f7864e() { return handleError(function (arg0) {
    var ret = getObject(arg0).innerHeight;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_devicePixelRatio_dc4405584b5cb63f(arg0) {
    var ret = getObject(arg0).devicePixelRatio;
    return ret;
};

export function __wbg_performance_800ff37c906b5f3b(arg0) {
    var ret = getObject(arg0).performance;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_localStorage_a79a5d8ee7487fcb() { return handleError(function (arg0) {
    var ret = getObject(arg0).localStorage;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_open_c8c0fa97b521eb3d() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_requestAnimationFrame_ef037dc409649fbf() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_setInterval_f3122aab24298341() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).setInterval(getObject(arg1), arg2);
    return ret;
}, arguments) };

export function __wbg_setTimeout_8462a0738ecca084() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
    return ret;
}, arguments) };

export function __wbg_top_8ad808e9af99b597(arg0) {
    var ret = getObject(arg0).top;
    return ret;
};

export function __wbg_left_1761db11f4e18020(arg0) {
    var ret = getObject(arg0).left;
    return ret;
};

export function __wbg_userAgent_5dc7c1e0bfc4a444() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg1).userAgent;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}, arguments) };

export function __wbg_hash_f1a1e37355e44338() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg1).hash;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}, arguments) };

export function __wbg_appendChild_9ba4c99688714f13() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).appendChild(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_clientX_9708d75fb355c54c(arg0) {
    var ret = getObject(arg0).clientX;
    return ret;
};

export function __wbg_clientY_73c641398c4e5a64(arg0) {
    var ret = getObject(arg0).clientY;
    return ret;
};

export function __wbg_button_75c49405361e7da4(arg0) {
    var ret = getObject(arg0).button;
    return ret;
};

export function __wbg_data_88b72680ff5c8d57(arg0, arg1) {
    var ret = getObject(arg1).data;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_getPropertyValue_8bca088cdd461081() { return handleError(function (arg0, arg1, arg2, arg3) {
    var ret = getObject(arg1).getPropertyValue(getStringFromWasm0(arg2, arg3));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}, arguments) };

export function __wbg_setProperty_881bd3ab228526b3() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_getItem_3fc9a85a5c86c097() { return handleError(function (arg0, arg1, arg2, arg3) {
    var ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}, arguments) };

export function __wbg_setItem_99592651ffc703f6() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbindgen_object_clone_ref(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_addEventListener_9b66d58c2a9ba39a() { return handleError(function (arg0, arg1, arg2, arg3) {
    getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
}, arguments) };

export function __wbg_deltaX_1eb557c7e0056588(arg0) {
    var ret = getObject(arg0).deltaX;
    return ret;
};

export function __wbg_deltaY_1ab9240217b48aa3(arg0) {
    var ret = getObject(arg0).deltaY;
    return ret;
};

export function __wbg_instanceof_HtmlCanvasElement_c9f334afe4eed430(arg0) {
    var ret = getObject(arg0) instanceof HTMLCanvasElement;
    return ret;
};

export function __wbg_width_726d17d6876631b4(arg0) {
    var ret = getObject(arg0).width;
    return ret;
};

export function __wbg_setwidth_41b2497107faaff7(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};

export function __wbg_height_5fd8d13e879338d0(arg0) {
    var ret = getObject(arg0).height;
    return ret;
};

export function __wbg_setheight_e15cb9243262e701(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
};

export function __wbg_getContext_d277f710e8035242() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_now_9f22124bc74da886(arg0) {
    var ret = getObject(arg0).now();
    return ret;
};

export function __wbg_pageX_01c8418913761f98(arg0) {
    var ret = getObject(arg0).pageX;
    return ret;
};

export function __wbg_pageY_74d7bf8fe7866455(arg0) {
    var ret = getObject(arg0).pageY;
    return ret;
};

export function __wbg_get_5fbce9875ca09f4a(arg0, arg1) {
    var ret = getObject(arg0)[arg1 >>> 0];
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_body_52b3f453148fd124(arg0) {
    var ret = getObject(arg0).body;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createElement_695120dd76150487() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getElementById_aeb1b7331ed88a97(arg0, arg1, arg2) {
    var ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_setid_d218dad355f902f5(arg0, arg1, arg2) {
    getObject(arg0).id = getStringFromWasm0(arg1, arg2);
};

export function __wbg_scrollLeft_93068559fff16a9f(arg0) {
    var ret = getObject(arg0).scrollLeft;
    return ret;
};

export function __wbg_getBoundingClientRect_6c4d67366fb08e31(arg0) {
    var ret = getObject(arg0).getBoundingClientRect();
    return addHeapObject(ret);
};

export function __wbg_instanceof_WebGlRenderingContext_bf4c1c161cce63d8(arg0) {
    var ret = getObject(arg0) instanceof WebGLRenderingContext;
    return ret;
};

export function __wbg_drawingBufferWidth_b31cf22e5817f6db(arg0) {
    var ret = getObject(arg0).drawingBufferWidth;
    return ret;
};

export function __wbg_drawingBufferHeight_985e8a982ad94907(arg0) {
    var ret = getObject(arg0).drawingBufferHeight;
    return ret;
};

export function __wbg_bufferData_1e028cc0639f0264(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
};

export function __wbg_texImage2D_b1d95ccb3f8fd616() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9 === 0 ? undefined : getArrayU8FromWasm0(arg9, arg10));
}, arguments) };

export function __wbg_activeTexture_ccd864030355beba(arg0, arg1) {
    getObject(arg0).activeTexture(arg1 >>> 0);
};

export function __wbg_attachShader_176dfde48c626eb8(arg0, arg1, arg2) {
    getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
};

export function __wbg_bindBuffer_aff83e0a72ebe9c6(arg0, arg1, arg2) {
    getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindTexture_3c4cdd29edc870f9(arg0, arg1, arg2) {
    getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
};

export function __wbg_blendFunc_ae81cbf4e0169885(arg0, arg1, arg2) {
    getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_clear_4026459dc218d806(arg0, arg1) {
    getObject(arg0).clear(arg1 >>> 0);
};

export function __wbg_clearColor_3feff7be5983725c(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
};

export function __wbg_compileShader_b154f866a37ef240(arg0, arg1) {
    getObject(arg0).compileShader(getObject(arg1));
};

export function __wbg_createBuffer_9cd00017c8012ded(arg0) {
    var ret = getObject(arg0).createBuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createProgram_1dc1d5b4f815c74e(arg0) {
    var ret = getObject(arg0).createProgram();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createShader_a568ae9716cf79bd(arg0, arg1) {
    var ret = getObject(arg0).createShader(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createTexture_9165d6614a3f8c26(arg0) {
    var ret = getObject(arg0).createTexture();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_disable_71a7779d266ab83f(arg0, arg1) {
    getObject(arg0).disable(arg1 >>> 0);
};

export function __wbg_drawElements_567b7125cfe5debf(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
};

export function __wbg_enable_8c08778f17ea82d3(arg0, arg1) {
    getObject(arg0).enable(arg1 >>> 0);
};

export function __wbg_enableVertexAttribArray_19841ca8c10ee785(arg0, arg1) {
    getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
};

export function __wbg_getAttribLocation_3cbba362123e3451(arg0, arg1, arg2, arg3) {
    var ret = getObject(arg0).getAttribLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return ret;
};

export function __wbg_getProgramInfoLog_b3af1c1f2f050ac5(arg0, arg1, arg2) {
    var ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_getProgramParameter_15c77e6ded344978(arg0, arg1, arg2) {
    var ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getShaderInfoLog_62bc93f21372bbdb(arg0, arg1, arg2) {
    var ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_getShaderParameter_b652420e47ea83c3(arg0, arg1, arg2) {
    var ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getUniformLocation_0e74513fa8e0fcef(arg0, arg1, arg2, arg3) {
    var ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_linkProgram_0a51f6ca8e067ba7(arg0, arg1) {
    getObject(arg0).linkProgram(getObject(arg1));
};

export function __wbg_scissor_53f081ef55d3977d(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).scissor(arg1, arg2, arg3, arg4);
};

export function __wbg_shaderSource_9f03812e74c7504e(arg0, arg1, arg2, arg3) {
    getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
};

export function __wbg_texParameteri_26de60b40766928f(arg0, arg1, arg2, arg3) {
    getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
};

export function __wbg_uniform1i_6a282c117216b6ef(arg0, arg1, arg2) {
    getObject(arg0).uniform1i(getObject(arg1), arg2);
};

export function __wbg_uniform2f_2c62de1e5acc87da(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform2f(getObject(arg1), arg2, arg3);
};

export function __wbg_useProgram_9174cae30cc67e4d(arg0, arg1) {
    getObject(arg0).useProgram(getObject(arg1));
};

export function __wbg_vertexAttribPointer_f1d73baac9e3b6e9(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
};

export function __wbg_viewport_f89fe7da7b1e24e2(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).viewport(arg1, arg2, arg3, arg4);
};

export function __wbg_log_8485ead621ceded9(arg0) {
    console.log(getObject(arg0));
};

export function __wbg_warn_eb158fa0859088bf(arg0) {
    console.warn(getObject(arg0));
};

export function __wbg_scrollTop_764b842265121804(arg0) {
    var ret = getObject(arg0).scrollTop;
    return ret;
};

export function __wbg_hidden_02641f46b467a34e(arg0) {
    var ret = getObject(arg0).hidden;
    return ret;
};

export function __wbg_sethidden_649e97e571d43123(arg0, arg1) {
    getObject(arg0).hidden = arg1 !== 0;
};

export function __wbg_style_6840ca6f1c83499f(arg0) {
    var ret = getObject(arg0).style;
    return addHeapObject(ret);
};

export function __wbg_offsetTop_e81e445560803250(arg0) {
    var ret = getObject(arg0).offsetTop;
    return ret;
};

export function __wbg_offsetLeft_18821d13e6dc28fc(arg0) {
    var ret = getObject(arg0).offsetLeft;
    return ret;
};

export function __wbg_offsetWidth_e85cd1147115a548(arg0) {
    var ret = getObject(arg0).offsetWidth;
    return ret;
};

export function __wbg_blur_b90f29a822a80071() { return handleError(function (arg0) {
    getObject(arg0).blur();
}, arguments) };

export function __wbg_focus_67ec816d6e2fd9da() { return handleError(function (arg0) {
    getObject(arg0).focus();
}, arguments) };

export function __wbg_instanceof_HtmlInputElement_bcbf72cd9188bbf5(arg0) {
    var ret = getObject(arg0) instanceof HTMLInputElement;
    return ret;
};

export function __wbg_setautofocus_328b8140f5f6438c(arg0, arg1) {
    getObject(arg0).autofocus = arg1 !== 0;
};

export function __wbg_setsize_e1a63a84898622eb(arg0, arg1) {
    getObject(arg0).size = arg1 >>> 0;
};

export function __wbg_value_9c8f7cca5ded6671(arg0, arg1) {
    var ret = getObject(arg1).value;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_setvalue_44d4bd0ac437904f(arg0, arg1, arg2) {
    getObject(arg0).value = getStringFromWasm0(arg1, arg2);
};

export function __wbg_keyCode_4390925021a31546(arg0) {
    var ret = getObject(arg0).keyCode;
    return ret;
};

export function __wbg_altKey_9ead66021848aa74(arg0) {
    var ret = getObject(arg0).altKey;
    return ret;
};

export function __wbg_ctrlKey_1e3e28894d756523(arg0) {
    var ret = getObject(arg0).ctrlKey;
    return ret;
};

export function __wbg_shiftKey_bf56a659d464f031(arg0) {
    var ret = getObject(arg0).shiftKey;
    return ret;
};

export function __wbg_metaKey_ad3c08fec6e4d71d(arg0) {
    var ret = getObject(arg0).metaKey;
    return ret;
};

export function __wbg_isComposing_bb034058b069282b(arg0) {
    var ret = getObject(arg0).isComposing;
    return ret;
};

export function __wbg_key_8642816c7d0fb736(arg0, arg1) {
    var ret = getObject(arg1).key;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_touches_335f913c6a1e3a84(arg0) {
    var ret = getObject(arg0).touches;
    return addHeapObject(ret);
};

export function __wbg_type_fa3c40df2d51e785(arg0, arg1) {
    var ret = getObject(arg1).type;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbg_preventDefault_2a53c6dce5093030(arg0) {
    getObject(arg0).preventDefault();
};

export function __wbg_stopPropagation_6177617793da16e6(arg0) {
    getObject(arg0).stopPropagation();
};

export function __wbg_call_8487a9f580e47219() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_newnoargs_179d393e4626fcf7(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_getHours_1af63180ed11b49d(arg0) {
    var ret = getObject(arg0).getHours();
    return ret;
};

export function __wbg_getMilliseconds_bde52242127a5c03(arg0) {
    var ret = getObject(arg0).getMilliseconds();
    return ret;
};

export function __wbg_getMinutes_9c21a27a8849d22a(arg0) {
    var ret = getObject(arg0).getMinutes();
    return ret;
};

export function __wbg_getSeconds_c5431d6c48f9ed3c(arg0) {
    var ret = getObject(arg0).getSeconds();
    return ret;
};

export function __wbg_new0_8c7faee4e4e8144d() {
    var ret = new Date();
    return addHeapObject(ret);
};

export function __wbg_self_eeabd9085c04fc17() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_f110c13310da2c8f() { return handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_a2669bee93faee43() { return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_a5584d717f4d6761() { return handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_buffer_e35e010c3ba9f945(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_new_5b74a8dd0c5b71ac(arg0) {
    var ret = new Int16Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_new_139e70222494b1ff(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_new_fe24eae01e10f223(arg0) {
    var ret = new Float32Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_subarray_7b811f5c80cb90d3(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_8a52f1c1a11c02a8(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_3c6f7cfb4edcc351(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_instanceof_Memory_7ec765ef65ff7aaa(arg0) {
    var ret = getObject(arg0) instanceof WebAssembly.Memory;
    return ret;
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbindgen_boolean_get(arg0) {
    const v = getObject(arg0);
    var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbindgen_debug_string(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_rethrow(arg0) {
    throw takeObject(arg0);
};

export function __wbindgen_memory() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper387(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 39, __wbg_adapter_24);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper388(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 39, __wbg_adapter_27);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper390(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 39, __wbg_adapter_30);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper392(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 39, __wbg_adapter_33);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper395(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 39, __wbg_adapter_36);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper397(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 39, __wbg_adapter_39);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper399(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 39, __wbg_adapter_42);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper401(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 39, __wbg_adapter_45);
    return addHeapObject(ret);
};


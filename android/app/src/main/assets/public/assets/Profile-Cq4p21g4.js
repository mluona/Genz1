import { c as createLucideIcon, r as reactExports, R as React, C as useAuth, B as useNavigate, w as jsxRuntimeExports, L as Link, P as LogOut, G as Search, X, y as supabase } from "./index-BNptM8td.js";
import { u as uploadToLocal } from "./localUpload-DN0fFoi0.js";
import { S as Sparkles } from "./sparkles-oMNtq1h9.js";
import { P as Pen } from "./pen-mIybmmv0.js";
import { C as Coins } from "./coins-Dzew_KuE.js";
import { S as Settings } from "./settings-CScUw-cZ.js";
import { H as Heart, C as ChevronRight } from "./heart-kEyEscBu.js";
import { B as BookOpen } from "./book-open-B8xp784j.js";
import { T as Tag } from "./tag-CQn2tcc2.js";
import { C as Clock } from "./clock-BUWQYWD4.js";
import { T as Trash2 } from "./trash-2-C0MAntLE.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
      key: "18u6gg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
];
const History = createLucideIcon("history", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
/*!
 * react-paypal-js v9.0.2 (2026-03-19T18:17:50.870Z)
 * Copyright 2020-present, PayPal, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var SCRIPT_LOADING_STATE;
(function(SCRIPT_LOADING_STATE2) {
  SCRIPT_LOADING_STATE2["INITIAL"] = "initial";
  SCRIPT_LOADING_STATE2["PENDING"] = "pending";
  SCRIPT_LOADING_STATE2["REJECTED"] = "rejected";
  SCRIPT_LOADING_STATE2["RESOLVED"] = "resolved";
})(SCRIPT_LOADING_STATE || (SCRIPT_LOADING_STATE = {}));
var DISPATCH_ACTION;
(function(DISPATCH_ACTION2) {
  DISPATCH_ACTION2["LOADING_STATUS"] = "setLoadingStatus";
  DISPATCH_ACTION2["RESET_OPTIONS"] = "resetOptions";
  DISPATCH_ACTION2["SET_BRAINTREE_INSTANCE"] = "braintreeInstance";
})(DISPATCH_ACTION || (DISPATCH_ACTION = {}));
var PAYPAL_HOSTED_FIELDS_TYPES;
(function(PAYPAL_HOSTED_FIELDS_TYPES2) {
  PAYPAL_HOSTED_FIELDS_TYPES2["NUMBER"] = "number";
  PAYPAL_HOSTED_FIELDS_TYPES2["CVV"] = "cvv";
  PAYPAL_HOSTED_FIELDS_TYPES2["EXPIRATION_DATE"] = "expirationDate";
  PAYPAL_HOSTED_FIELDS_TYPES2["EXPIRATION_MONTH"] = "expirationMonth";
  PAYPAL_HOSTED_FIELDS_TYPES2["EXPIRATION_YEAR"] = "expirationYear";
  PAYPAL_HOSTED_FIELDS_TYPES2["POSTAL_CODE"] = "postalCode";
})(PAYPAL_HOSTED_FIELDS_TYPES || (PAYPAL_HOSTED_FIELDS_TYPES = {}));
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest$1(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
var SCRIPT_ID = "data-react-paypal-script-id";
var SDK_SETTINGS = {
  DATA_JS_SDK_LIBRARY: "dataJsSdkLibrary",
  DATA_LIBRARY_VALUE: "react-paypal-js",
  DATA_NAMESPACE: "dataNamespace",
  DATA_SDK_INTEGRATION_SOURCE: "dataSdkIntegrationSource"
};
var LOAD_SCRIPT_ERROR = "Failed to load the PayPal JS SDK script.";
var DEFAULT_PAYPAL_NAMESPACE = "paypal";
var SCRIPT_PROVIDER_REDUCER_ERROR = "usePayPalScriptReducer must be used within a PayPalScriptProvider";
function getPayPalWindowNamespace$1(namespace) {
  if (namespace === void 0) {
    namespace = DEFAULT_PAYPAL_NAMESPACE;
  }
  return window[namespace];
}
function hashStr(str) {
  var hash = "";
  for (var i = 0; i < str.length; i++) {
    var total = str[i].charCodeAt(0) * i;
    if (str[i + 1]) {
      total += str[i + 1].charCodeAt(0) * (i - 1);
    }
    hash += String.fromCharCode(97 + Math.abs(total) % 26);
  }
  return hash;
}
function generateErrorMessage(_a) {
  var reactComponentName = _a.reactComponentName, sdkComponentKey = _a.sdkComponentKey, _b = _a.sdkRequestedComponents, sdkRequestedComponents = _b === void 0 ? "" : _b, _c = _a.sdkDataNamespace, sdkDataNamespace = _c === void 0 ? DEFAULT_PAYPAL_NAMESPACE : _c;
  var requiredOptionCapitalized = sdkComponentKey.charAt(0).toUpperCase().concat(sdkComponentKey.substring(1));
  var errorMessage = "Unable to render <".concat(reactComponentName, " /> because window.").concat(sdkDataNamespace, ".").concat(requiredOptionCapitalized, " is undefined.");
  var requestedComponents = typeof sdkRequestedComponents === "string" ? sdkRequestedComponents : sdkRequestedComponents.join(",");
  if (!requestedComponents.includes(sdkComponentKey)) {
    var expectedComponents = [requestedComponents, sdkComponentKey].filter(Boolean).join();
    errorMessage += "\nTo fix the issue, add '".concat(sdkComponentKey, "' to the list of components passed to the parent PayPalScriptProvider:") + "\n`<PayPalScriptProvider options={{ components: '".concat(expectedComponents, "'}}>`.");
  }
  return errorMessage;
}
function getScriptID(options) {
  var _a = options, _b = SCRIPT_ID;
  _a[_b];
  var paypalScriptOptions = __rest$1(_a, [_b + ""]);
  return "react-paypal-js-".concat(hashStr(JSON.stringify(paypalScriptOptions)));
}
function destroySDKScript(reactPayPalScriptID) {
  var scriptNode = self.document.querySelector("script[".concat(SCRIPT_ID, '="').concat(reactPayPalScriptID, '"]'));
  if (scriptNode === null || scriptNode === void 0 ? void 0 : scriptNode.parentNode) {
    scriptNode.parentNode.removeChild(scriptNode);
  }
}
function scriptReducer(state, action) {
  var _a, _b;
  switch (action.type) {
    case DISPATCH_ACTION.LOADING_STATUS:
      if (typeof action.value === "object") {
        return __assign(__assign({}, state), {
          loadingStatus: action.value.state,
          loadingStatusErrorMessage: action.value.message
        });
      }
      return __assign(__assign({}, state), {
        loadingStatus: action.value
      });
    case DISPATCH_ACTION.RESET_OPTIONS:
      destroySDKScript(state.options[SCRIPT_ID]);
      return __assign(__assign({}, state), {
        loadingStatus: SCRIPT_LOADING_STATE.PENDING,
        options: __assign(__assign((_a = {}, _a[SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _a), action.value), (_b = {}, _b[SCRIPT_ID] = "".concat(getScriptID(action.value)), _b))
      });
    case DISPATCH_ACTION.SET_BRAINTREE_INSTANCE:
      return __assign(__assign({}, state), {
        braintreePayPalCheckoutInstance: action.value
      });
    default: {
      return state;
    }
  }
}
var ScriptContext = reactExports.createContext(null);
function validateReducer(scriptContext) {
  if (typeof (scriptContext === null || scriptContext === void 0 ? void 0 : scriptContext.dispatch) === "function" && scriptContext.dispatch.length !== 0) {
    return scriptContext;
  }
  throw new Error(SCRIPT_PROVIDER_REDUCER_ERROR);
}
function usePayPalScriptReducer() {
  var scriptContext = validateReducer(reactExports.useContext(ScriptContext));
  var derivedStatusContext = __assign(__assign({}, scriptContext), {
    isInitial: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.INITIAL,
    isPending: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.PENDING,
    isResolved: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.RESOLVED,
    isRejected: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.REJECTED
  });
  return [derivedStatusContext, scriptContext.dispatch];
}
reactExports.createContext({});
function useProxyProps(props) {
  var proxyRef = reactExports.useRef(new Proxy({}, {
    get: function(target, prop, receiver) {
      if (typeof target[prop] === "function") {
        return function() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return target[prop].apply(target, args);
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  }));
  proxyRef.current = Object.assign(proxyRef.current, props);
  return proxyRef.current;
}
var PayPalButtons = function(_a) {
  var _b;
  var _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, children = _a.children, _e = _a.forceReRender, forceReRender = _e === void 0 ? [] : _e, buttonProps = __rest$1(_a, ["className", "disabled", "children", "forceReRender"]);
  var isDisabledStyle = disabled ? {
    opacity: 0.38
  } : {};
  var classNames = "".concat(className, " ").concat(disabled ? "paypal-buttons-disabled" : "").trim();
  var buttonsContainerRef = reactExports.useRef(null);
  var buttons = reactExports.useRef(null);
  var proxyProps = useProxyProps(buttonProps);
  var _f = usePayPalScriptReducer()[0], isResolved = _f.isResolved, options = _f.options;
  var _g = reactExports.useState(null), initActions = _g[0], setInitActions = _g[1];
  var _h = reactExports.useState(true), isEligible = _h[0], setIsEligible = _h[1];
  var _j = reactExports.useState(null), setErrorState = _j[1];
  function closeButtonsComponent() {
    if (buttons.current !== null) {
      buttons.current.close().catch(function() {
      });
    }
  }
  if ((_b = buttons.current) === null || _b === void 0 ? void 0 : _b.updateProps) {
    buttons.current.updateProps({
      message: buttonProps.message
    });
  }
  reactExports.useEffect(function() {
    if (isResolved === false) {
      return closeButtonsComponent;
    }
    var paypalWindowNamespace = getPayPalWindowNamespace$1(options.dataNamespace);
    if (paypalWindowNamespace === void 0 || paypalWindowNamespace.Buttons === void 0) {
      setErrorState(function() {
        throw new Error(generateErrorMessage({
          reactComponentName: PayPalButtons.displayName,
          sdkComponentKey: "buttons",
          sdkRequestedComponents: options.components,
          sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE]
        }));
      });
      return closeButtonsComponent;
    }
    var decoratedOnInit = function(data, actions) {
      setInitActions(actions);
      if (typeof buttonProps.onInit === "function") {
        buttonProps.onInit(data, actions);
      }
    };
    try {
      buttons.current = paypalWindowNamespace.Buttons(__assign(__assign({}, proxyProps), {
        onInit: decoratedOnInit
      }));
    } catch (err) {
      return setErrorState(function() {
        throw new Error("Failed to render <PayPalButtons /> component. Failed to initialize:  ".concat(err));
      });
    }
    if (buttons.current.isEligible() === false) {
      setIsEligible(false);
      return closeButtonsComponent;
    }
    if (!buttonsContainerRef.current) {
      return closeButtonsComponent;
    }
    buttons.current.render(buttonsContainerRef.current).catch(function(err) {
      if (buttonsContainerRef.current === null || buttonsContainerRef.current.children.length === 0) {
        return;
      }
      setErrorState(function() {
        throw new Error("Failed to render <PayPalButtons /> component. ".concat(err));
      });
    });
    return closeButtonsComponent;
  }, __spreadArray(__spreadArray([isResolved], forceReRender, true), [buttonProps.fundingSource], false));
  reactExports.useEffect(function() {
    if (initActions === null) {
      return;
    }
    if (disabled === true) {
      initActions.disable().catch(function() {
      });
    } else {
      initActions.enable().catch(function() {
      });
    }
  }, [disabled, initActions]);
  return React.createElement(React.Fragment, null, isEligible ? React.createElement("div", {
    ref: buttonsContainerRef,
    style: isDisabledStyle,
    className: classNames
  }) : children);
};
PayPalButtons.displayName = "PayPalButtons";
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function findScript(url, attributes) {
  var currentScript = document.querySelector('script[src="'.concat(url, '"]'));
  if (currentScript === null) return null;
  var nextScript = createScriptElement(url, attributes);
  var currentScriptClone = currentScript.cloneNode();
  delete currentScriptClone.dataset.uidAuto;
  if (Object.keys(currentScriptClone.dataset).length !== Object.keys(nextScript.dataset).length) {
    return null;
  }
  var isExactMatch = true;
  Object.keys(currentScriptClone.dataset).forEach(function(key) {
    if (currentScriptClone.dataset[key] !== nextScript.dataset[key]) {
      isExactMatch = false;
    }
  });
  return isExactMatch ? currentScript : null;
}
function insertScriptElement(_a) {
  var url = _a.url, attributes = _a.attributes, onSuccess = _a.onSuccess, onError = _a.onError;
  var newScript = createScriptElement(url, attributes);
  newScript.onerror = onError;
  newScript.onload = onSuccess;
  document.head.insertBefore(newScript, document.head.firstElementChild);
}
function processOptions(_a) {
  var customSdkBaseUrl = _a.sdkBaseUrl, environment = _a.environment, options = __rest(_a, ["sdkBaseUrl", "environment"]);
  var sdkBaseUrl = customSdkBaseUrl || processSdkBaseUrl(environment);
  var optionsWithStringIndex = options;
  var _b = Object.keys(optionsWithStringIndex).filter(function(key) {
    return typeof optionsWithStringIndex[key] !== "undefined" && optionsWithStringIndex[key] !== null && optionsWithStringIndex[key] !== "";
  }).reduce(function(accumulator, key) {
    var value = optionsWithStringIndex[key].toString();
    key = camelCaseToKebabCase(key);
    if (key.substring(0, 4) === "data" || key === "crossorigin") {
      accumulator.attributes[key] = value;
    } else {
      accumulator.queryParams[key] = value;
    }
    return accumulator;
  }, {
    queryParams: {},
    attributes: {}
  }), queryParams = _b.queryParams, attributes = _b.attributes;
  if (queryParams["merchant-id"] && queryParams["merchant-id"].indexOf(",") !== -1) {
    attributes["data-merchant-id"] = queryParams["merchant-id"];
    queryParams["merchant-id"] = "*";
  }
  return {
    url: "".concat(sdkBaseUrl, "?").concat(objectToQueryString(queryParams)),
    attributes
  };
}
function camelCaseToKebabCase(str) {
  var replacer = function(match, indexOfMatch) {
    return (indexOfMatch ? "-" : "") + match.toLowerCase();
  };
  return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, replacer);
}
function objectToQueryString(params) {
  var queryString = "";
  Object.keys(params).forEach(function(key) {
    if (queryString.length !== 0) queryString += "&";
    queryString += key + "=" + params[key];
  });
  return queryString;
}
function processSdkBaseUrl(environment) {
  return environment === "sandbox" ? "https://www.sandbox.paypal.com/sdk/js" : "https://www.paypal.com/sdk/js";
}
function createScriptElement(url, attributes) {
  if (attributes === void 0) {
    attributes = {};
  }
  var newScript = document.createElement("script");
  newScript.src = url;
  Object.keys(attributes).forEach(function(key) {
    newScript.setAttribute(key, attributes[key]);
    if (key === "data-csp-nonce") {
      newScript.setAttribute("nonce", attributes["data-csp-nonce"]);
    }
  });
  return newScript;
}
function loadScript(options, PromisePonyfill) {
  if (PromisePonyfill === void 0) {
    PromisePonyfill = Promise;
  }
  validateArguments(options, PromisePonyfill);
  if (typeof document === "undefined") return PromisePonyfill.resolve(null);
  var _a = processOptions(options), url = _a.url, attributes = _a.attributes;
  var namespace = attributes["data-namespace"] || "paypal";
  var existingWindowNamespace = getPayPalWindowNamespace(namespace);
  if (!attributes["data-js-sdk-library"]) {
    attributes["data-js-sdk-library"] = "paypal-js";
  }
  if (findScript(url, attributes) && existingWindowNamespace) {
    return PromisePonyfill.resolve(existingWindowNamespace);
  }
  return loadCustomScript({
    url,
    attributes
  }, PromisePonyfill).then(function() {
    var newWindowNamespace = getPayPalWindowNamespace(namespace);
    if (newWindowNamespace) {
      return newWindowNamespace;
    }
    throw new Error("The window.".concat(namespace, " global variable is not available."));
  });
}
function loadCustomScript(options, PromisePonyfill) {
  if (PromisePonyfill === void 0) {
    PromisePonyfill = Promise;
  }
  validateArguments(options, PromisePonyfill);
  var url = options.url, attributes = options.attributes;
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("Invalid url.");
  }
  if (typeof attributes !== "undefined" && typeof attributes !== "object") {
    throw new Error("Expected attributes to be an object.");
  }
  return new PromisePonyfill(function(resolve, reject) {
    if (typeof document === "undefined") return resolve();
    insertScriptElement({
      url,
      attributes,
      onSuccess: function() {
        return resolve();
      },
      onError: function() {
        var defaultError = new Error('The script "'.concat(url, '" failed to load. Check the HTTP status code and response body in DevTools to learn more.'));
        return reject(defaultError);
      }
    });
  });
}
function getPayPalWindowNamespace(namespace) {
  return window[namespace];
}
function validateArguments(options, PromisePonyfill) {
  if (typeof options !== "object" || options === null) {
    throw new Error("Expected an options object.");
  }
  var environment = options.environment;
  if (environment && environment !== "production" && environment !== "sandbox") {
    throw new Error('The `environment` option must be either "production" or "sandbox".');
  }
  if (typeof PromisePonyfill !== "undefined" && typeof PromisePonyfill !== "function") {
    throw new Error("Expected PromisePonyfill to be a function.");
  }
}
var PayPalScriptProvider = function(_a) {
  var _b;
  var _c = _a.options, options = _c === void 0 ? {
    clientId: "test"
  } : _c, children = _a.children, _d = _a.deferLoading, deferLoading = _d === void 0 ? false : _d;
  var _e = reactExports.useReducer(scriptReducer, {
    options: __assign(__assign({}, options), (_b = {}, _b[SDK_SETTINGS.DATA_JS_SDK_LIBRARY] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _b[SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _b[SCRIPT_ID] = "".concat(getScriptID(options)), _b)),
    loadingStatus: deferLoading ? SCRIPT_LOADING_STATE.INITIAL : SCRIPT_LOADING_STATE.PENDING
  }), state = _e[0], dispatch = _e[1];
  reactExports.useEffect(function() {
    if (deferLoading === false && state.loadingStatus === SCRIPT_LOADING_STATE.INITIAL) {
      return dispatch({
        type: DISPATCH_ACTION.LOADING_STATUS,
        value: SCRIPT_LOADING_STATE.PENDING
      });
    }
    if (state.loadingStatus !== SCRIPT_LOADING_STATE.PENDING) {
      return;
    }
    var isSubscribed = true;
    loadScript(state.options).then(function() {
      if (isSubscribed) {
        dispatch({
          type: DISPATCH_ACTION.LOADING_STATUS,
          value: SCRIPT_LOADING_STATE.RESOLVED
        });
      }
    }).catch(function(err) {
      console.error("".concat(LOAD_SCRIPT_ERROR, " ").concat(err));
      if (isSubscribed) {
        dispatch({
          type: DISPATCH_ACTION.LOADING_STATUS,
          value: {
            state: SCRIPT_LOADING_STATE.REJECTED,
            message: String(err)
          }
        });
      }
    });
    return function() {
      isSubscribed = false;
    };
  }, [state.options, deferLoading, state.loadingStatus]);
  return React.createElement(ScriptContext.Provider, {
    value: __assign(__assign({}, state), {
      dispatch
    })
  }, children);
};
function ignore() {
  return;
}
reactExports.createContext({
  cardFieldsForm: null,
  fields: {},
  registerField: ignore,
  // implementation is inside hook and passed through the provider
  unregisterField: ignore
  // implementation is inside hook and passed through the provider
});
const Profile = () => {
  var _a, _b, _c;
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = reactExports.useRef(null);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    username: "",
    bio: "",
    profilePicture: ""
  });
  const [activeTab, setActiveTab] = reactExports.useState("history");
  const [transactions, setTransactions] = reactExports.useState([]);
  const [coinPackages, setCoinPackages] = reactExports.useState([]);
  const [selectedPackage, setSelectedPackage] = reactExports.useState(null);
  const [favoriteSeries, setFavoriteSeries] = reactExports.useState([]);
  const [historySeries, setHistorySeries] = reactExports.useState([]);
  const [isLoadingData, setIsLoadingData] = reactExports.useState(true);
  const [favoriteSearch, setFavoriteSearch] = reactExports.useState("");
  const [favoriteType, setFavoriteType] = reactExports.useState("all");
  const [favoriteSort, setFavoriteSort] = reactExports.useState("title");
  reactExports.useEffect(() => {
    if (activeTab === "wallet" && user) {
      const fetchTransactionsAndPackages = async () => {
        try {
          const { data: txData, error: txError } = await supabase.from("transactions").select("*").eq("userId", user.id).order("createdAt", { ascending: false });
          if (txError) throw txError;
          setTransactions(txData || []);
          const { data: pkgData, error: pkgError } = await supabase.from("coin_packages").select("*").eq("isActive", true).order("coins", { ascending: true });
          if (pkgError) throw pkgError;
          setCoinPackages(pkgData || []);
        } catch (error) {
          console.error("Error fetching wallet data:", error);
        }
      };
      fetchTransactionsAndPackages();
    }
  }, [activeTab, user]);
  reactExports.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        bio: profile.bio || "",
        profilePicture: profile.profilePicture || ""
      });
    }
  }, [profile]);
  reactExports.useEffect(() => {
    const fetchUserData = async () => {
      var _a2, _b2;
      if (!profile) return;
      setIsLoadingData(true);
      try {
        const allSeriesIds = /* @__PURE__ */ new Set();
        (_a2 = profile.favorites) == null ? void 0 : _a2.forEach((id) => allSeriesIds.add(id));
        (_b2 = profile.history) == null ? void 0 : _b2.forEach((h) => allSeriesIds.add(h.seriesId));
        if (allSeriesIds.size === 0) {
          setFavoriteSeries([]);
          setHistorySeries([]);
          setIsLoadingData(false);
          return;
        }
        const idsArray = Array.from(allSeriesIds);
        const { data: seriesData, error: seriesError } = await supabase.from("series").select("*").in("id", idsArray);
        if (seriesError) throw seriesError;
        const seriesMap = /* @__PURE__ */ new Map();
        seriesData == null ? void 0 : seriesData.forEach((s) => seriesMap.set(s.id, s));
        const uniqueFavorites = Array.from(new Set(profile.favorites || []));
        const favs = uniqueFavorites.map((id) => seriesMap.get(id)).filter(Boolean);
        setFavoriteSeries(favs);
        const hist = (profile.history || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).filter((h, index, self2) => index === self2.findIndex((t) => t.seriesId === h.seriesId)).map((h) => {
          const s = seriesMap.get(h.seriesId);
          return s ? { ...s, lastChapterId: h.lastChapterId } : null;
        }).filter(Boolean);
        setHistorySeries(hist);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchUserData();
  }, [profile]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 text-sm font-medium", children: "جاري تحميل ملفك الشخصي..." })
    ] });
  }
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-10 h-10" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black tracking-tight text-white", children: "الرجاء تسجيل الدخول" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-400 text-sm", children: "يجب عليك تسجيل الدخول أو إنشاء حساب جديد للوصول إلى الملف الشخصي وخدمات المحفظة." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-300", children: "الذهاب للرئيسية" })
    ] });
  }
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("profiles").update(formData).eq("id", user.id);
      if (error) throw error;
      await refreshProfile(user.id);
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  const triggerFileSelect = () => {
    var _a2;
    (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
  };
  const handleProfilePictureUpload = async (e) => {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profilePicture: objectUrl }));
      const fileExt = file.name.split(".").pop() || "jpg";
      const filename = `profile_pictures/${user == null ? void 0 : user.id}_${Date.now()}.${fileExt}`;
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;
      const downloadUrl = await uploadToLocal(base64Data, filename, file.type);
      if (!downloadUrl) throw new Error("Upload failed, no URL returned");
      const { error: dbError } = await supabase.from("profiles").update({ profilePicture: downloadUrl }).eq("id", (user == null ? void 0 : user.id) || "");
      if (dbError) throw dbError;
      setFormData((prev) => ({ ...prev, profilePicture: downloadUrl }));
      if (user) await refreshProfile(user.id);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };
  const toggleFavoriteFromProfile = async (seriesId, e) => {
    var _a2;
    e.preventDefault();
    e.stopPropagation();
    if (!profile || !user) return;
    const wasFavorite = (_a2 = profile.favorites) == null ? void 0 : _a2.includes(seriesId);
    let newFavorites = [...profile.favorites || []];
    if (wasFavorite) {
      newFavorites = newFavorites.filter((id) => id !== seriesId);
    } else {
      newFavorites.push(seriesId);
    }
    setFavoriteSeries((prev) => prev.filter((s) => s.id !== seriesId));
    try {
      const { error } = await supabase.from("profiles").update({ favorites: newFavorites }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile(user.id);
    } catch (error) {
      console.error("Error toggling favorite from profile:", error);
      await refreshProfile(user.id);
    }
  };
  const deleteFromHistory = async (seriesId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile || !user) return;
    const newHistory = (profile.history || []).filter((h) => h.seriesId !== seriesId);
    setHistorySeries((prev) => prev.filter((s) => s.id !== seriesId));
    try {
      const { error } = await supabase.from("profiles").update({ history: newHistory }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile(user.id);
    } catch (error) {
      console.error("Error deleting reading history item:", error);
      await refreshProfile(user.id);
    }
  };
  const handlePurchaseCoins = async (amount, price) => {
    if (!user || !profile) return;
    try {
      const { error: profileError } = await supabase.from("profiles").update({
        coins: (profile.coins || 0) + amount
      }).eq("id", user.id);
      if (profileError) throw profileError;
      const { error: transError } = await supabase.from("transactions").insert([{
        userId: user.id,
        amount,
        type: "purchase",
        description: `شراء ${amount} عملة بسعر $${price.toFixed(2)}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }]);
      if (transError) throw transError;
      alert(`تم شراء ${amount} عملة بنجاح!`);
      setSelectedPackage(null);
      await refreshProfile(user.id);
      const { data: txData } = await supabase.from("transactions").select("*").eq("userId", user.id).order("createdAt", { ascending: false });
      setTransactions(txData || []);
    } catch (error) {
      console.error("Error purchasing coins:", error);
      alert("فشل شراء العملات");
    }
  };
  const filteredFavorites = favoriteSeries.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(favoriteSearch.toLowerCase()) || s.description && s.description.toLowerCase().includes(favoriteSearch.toLowerCase());
    const matchesType = favoriteType === "all" ? true : s.type.toLowerCase() === favoriteType.toLowerCase();
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (favoriteSort === "title") {
      return a.title.localeCompare(b.title, ["ar", "en"]);
    } else if (favoriteSort === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    } else {
      return b.id.localeCompare(a.id);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-zinc-950 text-white pb-24 font-sans text-right", dir: "rtl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[25vh] bg-gradient-to-b from-emerald-950/20 via-zinc-900 to-zinc-950 overflow-hidden border-b border-white/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent animate-pulse duration-[10000ms]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:32px_32px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-8 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full lg:w-80 shrink-0 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 text-center space-y-6 shadow-2xl relative overflow-hidden group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-12 -top-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                onClick: triggerFileSelect,
                className: "relative w-32 h-32 rounded-full cursor-pointer overflow-hidden border-4 border-zinc-950 shadow-2xl mx-auto group/avatar transition-transform duration-300 active:scale-95",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: formData.profilePicture || (profile == null ? void 0 : profile.profilePicture) || ((_a = user.user_metadata) == null ? void 0 : _a.avatar_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                      className: `w-full h-full object-cover transition-all duration-300 group-hover/avatar:scale-110 ${isUploading ? "opacity-40 animate-pulse" : ""}`,
                      alt: "Profile",
                      referrerPolicy: "no-referrer"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-6 h-6 text-emerald-400" }) }),
                  isUploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-black/75 flex flex-col items-center justify-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-emerald-400 mt-2 font-bold font-mono", children: "...جاري الرفع" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: triggerFileSelect,
                className: "absolute bottom-1 hover:scale-110 active:scale-95 left-2 p-2.5 bg-emerald-500 text-black rounded-full shadow-lg transition-transform",
                title: "تغيير الصورة الشخصية",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                ref: fileInputRef,
                accept: "image/*",
                onChange: handleProfilePictureUpload,
                className: "hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2", children: [
              profile == null ? void 0 : profile.username,
              (profile == null ? void 0 : profile.role) === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-emerald-400 animate-pulse" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 text-xs font-semibold font-mono", children: user.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-400 text-sm leading-relaxed px-2 bg-zinc-950/40 py-3 rounded-2xl border border-white/[0.02]", children: (profile == null ? void 0 : profile.bio) || "لا توجد نبذة تعريفية بعد." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl ${(profile == null ? void 0 : profile.role) === "admin" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400"}`, children: (profile == null ? void 0 : profile.role) === "admin" ? "مدير النظام" : "عضو ذهبي" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-white/5 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setIsEditing(!isEditing),
                className: `w-full flex items-center justify-center gap-2 py-3 font-bold rounded-2xl transition-all duration-300 ${isEditing ? "bg-zinc-700 text-white hover:bg-zinc-600" : "bg-white text-black hover:bg-zinc-200"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4" }),
                  " ",
                  isEditing ? "إلغاء التعديل" : "تعديل الحساب"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleLogout,
                className: "w-full flex items-center justify-center gap-2 py-3 bg-zinc-950/50 text-red-500 font-bold rounded-2xl hover:bg-red-500/10 transition-colors border border-red-500/10",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4" }),
                  " تسجيل الخروج"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-black text-sm tracking-widest text-zinc-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-emerald-500" }),
            " الإحصائيات العامة"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 bg-zinc-950/60 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-black text-emerald-400", children: ((_b = profile == null ? void 0 : profile.favorites) == null ? void 0 : _b.length) || 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-1 font-black text-zinc-500 tracking-widest", children: "المفضلة" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 bg-zinc-950/60 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-black text-blue-400", children: ((_c = profile == null ? void 0 : profile.history) == null ? void 0 : _c.length) || 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-1 font-black text-zinc-500 tracking-widest", children: "السجل" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-6 border-t border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 text-center relative overflow-hidden group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl translate-x-4 -translate-y-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce duration-1000" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-black text-amber-500 tracking-tight font-mono hover:scale-105 transition-transform", children: (profile == null ? void 0 : profile.coins) || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black text-amber-500/60 uppercase tracking-widest mt-1", children: "العملات المتاحة" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 w-full space-y-8", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black", children: "إعدادات الحساب" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleUpdate, className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "اسم المستخدم" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: formData.username,
                onChange: (e) => setFormData({ ...formData, username: e.target.value }),
                className: "w-full bg-zinc-950 border border-white/10 rounded-2xl px-4 py-3.5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none text-white font-medium",
                placeholder: "أدخل اسم مستخدم جديد..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "النبذة التعريفية" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                rows: 4,
                value: formData.bio,
                onChange: (e) => setFormData({ ...formData, bio: e.target.value }),
                className: "w-full bg-zinc-950 border border-white/10 rounded-2xl px-4 py-3.5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none resize-none text-white font-medium text-sm leading-relaxed",
                placeholder: "نبذة بسيطة تظهر لبقية المستخدمين..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "رابط صورة الملف الشخصي" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: formData.profilePicture,
                onChange: (e) => setFormData({ ...formData, profilePicture: e.target.value }),
                className: "w-full bg-zinc-950 border border-white/10 rounded-2xl px-4 py-3.5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none text-white font-medium",
                placeholder: "أدخل رابط صورة (مثل https://imgur.com/...)",
                dir: "ltr"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 pt-4 border-t border-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                className: "px-8 py-3.5 bg-emerald-500 text-black font-black uppercase tracking-wider rounded-2xl hover:bg-emerald-400 shadow-lg active:scale-95 transition-all duration-200",
                children: "حفظ التغييرات"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setIsEditing(false),
                className: "px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl active:scale-95 transition-all duration-200",
                children: "إلغاء"
              }
            )
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-1.5 bg-zinc-900 border border-white/5 rounded-2xl overflow-x-auto no-scrollbar shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setActiveTab("history"),
              className: `flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-black transition-all duration-300 rounded-xl whitespace-nowrap ${activeTab === "history" ? "bg-white text-black shadow-lg scale-[1.02]" : "text-zinc-500 hover:text-white hover:bg-white/5"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4" }),
                "سجل القراءة"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setActiveTab("favorites"),
              className: `flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-black transition-all duration-300 rounded-xl whitespace-nowrap ${activeTab === "favorites" ? "bg-white text-black shadow-lg scale-[1.02]" : "text-zinc-500 hover:text-white hover:bg-white/5"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-4 h-4" }),
                "المفضلة"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setActiveTab("wallet"),
              className: `flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-black transition-all duration-300 rounded-xl whitespace-nowrap ${activeTab === "wallet" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-[1.02]" : "text-zinc-500 hover:text-amber-500 hover:bg-amber-500/5"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-4 h-4" }),
                "المحفظة الرقمية"
              ]
            }
          )
        ] }),
        activeTab === "favorites" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-zinc-900/40 p-4 rounded-3xl border border-white/5 space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full md:w-72", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "ابحث في مفضلتك...",
                  value: favoriteSearch,
                  onChange: (e) => setFavoriteSearch(e.target.value),
                  className: "w-full bg-zinc-950 border border-white/5 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white focus:border-emerald-500/50 outline-none"
                }
              ),
              favoriteSearch && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFavoriteSearch(""), className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: favoriteSort,
                onChange: (e) => setFavoriteSort(e.target.value),
                className: "bg-zinc-950 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-bold text-zinc-300 outline-none focus:border-emerald-500/50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "title", children: "الترتيب الأبجدي" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rating", children: "الأعلى تقييماً" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "newest", children: "المضافة حديثاً" })
                ]
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", children: isLoadingData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full py-16 flex flex-col items-center justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 text-xs font-medium", children: "جاري تحميل المفضلة..." })
          ] }) : filteredFavorites.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full py-16 bg-zinc-900/20 border border-dashed border-white/5 rounded-3xl text-center space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-12 h-12 text-zinc-600 mx-auto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-zinc-400", children: "لا توجد روايات في المفضلة" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-600 text-xs max-w-xs mx-auto", children: "عند قيامك بحفظ رواياتك المفضلة لديك، ستظهر هنا للوصول السريع إليها." })
            ] })
          ] }) : filteredFavorites.map((series) => {
            const matchedHistory = historySeries.find((h) => h.id === series.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/5 hover:border-emerald-400/20 transition-all duration-300",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: series.coverImage || void 0,
                      alt: series.title,
                      className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700",
                      referrerPolicy: "no-referrer"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/40 opacity-90 group-hover:opacity-100 transition-opacity" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => toggleFavoriteFromProfile(series.id, e),
                      className: "absolute top-3 left-3 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/5 hover:scale-110 active:scale-95 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 text-emerald-400 transition-all duration-200 shadow-xl",
                      title: "إزالة من المفضلة",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-3.5 h-3.5 fill-current" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 right-3 flex flex-col gap-1 items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 text-[8px] font-black uppercase rounded-md tracking-wider ${series.status === "Ongoing" ? "bg-emerald-500 text-black" : "bg-blue-500 text-white"}`, children: series.status === "Ongoing" ? "مستمر" : "مكتمل" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-4 space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-extrabold text-sm truncate text-white leading-tight", dir: "auto", children: series.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black tracking-widest text-emerald-400 uppercase", children: "رواية" }),
                      series.rating && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-2.5 h-2.5 text-amber-500 fill-amber-500" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-zinc-300 font-mono", children: series.rating.toFixed(1) })
                      ] })
                    ] }),
                    matchedHistory && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Link,
                      {
                        to: `/series/${series.slug}`,
                        className: "flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-black rounded-xl text-[10px] font-black transition-colors",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-3 h-3" }),
                          "متابعة القراءة"
                        ]
                      }
                    )
                  ] })
                ]
              },
              series.id
            );
          }) })
        ] }),
        activeTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-5 h-5 text-emerald-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black uppercase tracking-tight", children: "سجل التصفح والقراءة" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: isLoadingData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 flex flex-col items-center justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 text-xs font-medium", children: "جاري الحصول على سجل القراءة..." })
          ] }) : historySeries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 bg-zinc-900/20 border border-dashed border-white/5 rounded-3xl text-center space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-12 h-12 text-zinc-600 mx-auto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-zinc-400", children: "سجل القراءة فارغ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-600 text-xs max-w-xs mx-auto", children: "لم تقم بقراءة أي فصول حتى الآن. تصفح الفصول المتاحة لاكتشاف عوالم جديدة." })
            ] })
          ] }) : historySeries.map((series) => {
            var _a2;
            const historyObject = (_a2 = profile == null ? void 0 : profile.history) == null ? void 0 : _a2.find((h) => h.seriesId === series.id);
            const lastReadTime = (historyObject == null ? void 0 : historyObject.timestamp) ? new Date(historyObject.timestamp).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) : "غير معروف";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/30 hover:bg-zinc-900 border border-white/5 rounded-3xl p-4 transition-all duration-300 group",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/series/${series.slug}`, className: "relative shrink-0 w-20 h-28 sm:w-16 sm:h-22 rounded-2xl overflow-hidden border border-white/5 shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: series.coverImage || void 0, alt: series.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", referrerPolicy: "no-referrer" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 text-right space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/series/${series.slug}`, className: "inline-block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-extrabold text-white text-base group-hover:text-emerald-400 leading-snug transition-colors", dir: "auto", children: series.title }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-medium bg-zinc-950/80 px-2 py-0.5 rounded-md text-[10px] font-mono border border-white/[0.03]", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3 h-3 text-emerald-500" }),
                        series.type
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-mono text-xs text-zinc-500", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5 text-zinc-600" }),
                        "آخر قراءة: ",
                        lastReadTime
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Link,
                      {
                        to: `/series/${series.slug}`,
                        className: "flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 font-bold hover:bg-emerald-400 text-black text-xs rounded-xl shadow-lg transition-colors active:scale-95",
                        children: [
                          "استئناف القراءة",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: (e) => deleteFromHistory(series.id, e),
                        className: "p-2.5 bg-zinc-950/60 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-white/5 hover:border-red-500/20 transition-all active:scale-95",
                        title: "حذف من سجل القراءة",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                      }
                    )
                  ] })
                ]
              },
              series.id
            );
          }) })
        ] }),
        activeTab === "wallet" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-6 h-6 text-amber-500 animate-pulse" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-extrabold text-white", children: "باقات الشحن المتوفرة" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-500/15 text-amber-400 font-black px-3 py-1 rounded-xl border border-amber-500/25", children: "شحن فوري" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: coinPackages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full text-center py-12 text-zinc-500 font-medium italic bg-zinc-950/40 rounded-3xl border border-white/5", children: "لا تتوفر باقات شحن عملات مفعلة حالياً." }) : coinPackages.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "bg-zinc-950/80 border border-white/5 hover:border-amber-500/20 rounded-3xl p-6 text-center transition-all duration-300 group relative overflow-hidden flex flex-col justify-between",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" }),
                  (pkg.bonusCoins || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 inset-x-0 bg-amber-500 text-black text-[10px] font-black uppercase py-1.5 tracking-wider shadow-md", children: [
                    "بونص: +",
                    pkg.bonusCoins,
                    " عملة إضافية 🎉"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-${(pkg.bonusCoins || 0) > 0 ? "6" : "2"} space-y-4 mb-6`, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-6 h-6 text-amber-500" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-black text-white font-mono tracking-tight", children: pkg.coins }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500 font-bold", children: "عملة أساسية" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setSelectedPackage(pkg),
                      className: "w-full py-3.5 bg-zinc-900 border border-white/5 hover:bg-amber-500 text-white hover:text-black font-extrabold rounded-2xl transition-all duration-300 shadow-md active:scale-95",
                      children: [
                        pkg.price.toFixed(2),
                        " ",
                        pkg.currency || "USD"
                      ]
                    }
                  )
                ]
              },
              pkg.id
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-5 h-5 text-amber-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black uppercase tracking-tight", children: "سجل معاملات المحفظة" })
            ] }),
            transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 bg-zinc-950/40 rounded-3xl border border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 text-sm italic", children: "لا توجد أي معاملات سابقة بعد." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: transactions.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between p-4 bg-zinc-950/80 rounded-2xl border border-white/5 hover:border-white/10 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-right", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-extrabold text-sm text-zinc-100", children: tx.description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-zinc-500 font-medium font-mono", children: tx.timestamp ? new Date(tx.timestamp).toLocaleString("ar-EG") : "الآن" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-black text-base font-mono ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`, children: [
                    tx.amount > 0 ? "+" : "",
                    tx.amount
                  ] })
                ]
              },
              tx.id
            )) })
          ] })
        ] })
      ] }) })
    ] }) }),
    selectedPackage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900 border border-white/10 rounded-[2.25rem] p-6 sm:p-8 max-w-md w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.8)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedPackage(null),
          className: "absolute top-4 left-4 p-2.5 bg-zinc-950/80 hover:bg-white hover:text-black rounded-full border border-white/5 text-zinc-400 transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mb-6 pt-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-6 h-6 text-amber-500 animate-pulse" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black", children: "إتمام عملية الشراء" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-zinc-400 text-sm", children: [
            "شحن ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500 font-extrabold", children: selectedPackage.coins + (selectedPackage.bonusCoins || 0) }),
            " عملة إلى محفظتك الشخصية."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-zinc-950 rounded-2xl border border-white/5 mb-6 text-xs space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500", children: "الباقة المختارة:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white font-extrabold", children: [
            selectedPackage.coins,
            " عملة"
          ] })
        ] }),
        (selectedPackage.bonusCoins || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500", children: "العملات الإضافية (البونص):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-400 font-extrabold", children: [
            "+",
            selectedPackage.bonusCoins,
            " عملة"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-medium pt-2 border-t border-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "إجمالي السعر:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-500 font-extrabold text-sm", children: [
            "$",
            selectedPackage.price.toFixed(2),
            " USD"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PayPalScriptProvider, { options: { clientId: "test", currency: selectedPackage.currency || "USD" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        PayPalButtons,
        {
          style: { layout: "vertical", color: "gold", shape: "pill" },
          createOrder: (data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: selectedPackage.currency || "USD",
                    value: selectedPackage.price.toString()
                  },
                  description: `شحن ${selectedPackage.coins + (selectedPackage.bonusCoins || 0)} Coins`
                }
              ]
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              handlePurchaseCoins(selectedPackage.coins + (selectedPackage.bonusCoins || 0), selectedPackage.price);
            });
          },
          onError: (err) => {
            console.error("PayPal Checkout onError", err);
            alert("خطأ أثناء معالجة تفاصيل الشراء.");
          }
        }
      ) })
    ] }) })
  ] });
};
export {
  Profile
};

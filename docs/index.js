(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.LitEpicSpinners = {})));
}(this, (function (exports) { 'use strict';

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  window.JSCompiler_renameProperty = function(prop) { return prop; };

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  // unique global id for deduping mixins.
  let dedupeId = 0;

  /* eslint-disable valid-jsdoc */
  /**
   * Wraps an ES6 class expression mixin such that the mixin is only applied
   * if it has not already been applied its base argument. Also memoizes mixin
   * applications.
   *
   * @template T
   * @param {T} mixin ES6 class expression mixin to wrap
   * @return {T}
   * @suppress {invalidCasts}
   */
  const dedupingMixin = function(mixin) {
    let mixinApplications = /** @type {!MixinFunction} */(mixin).__mixinApplications;
    if (!mixinApplications) {
      mixinApplications = new WeakMap();
      /** @type {!MixinFunction} */(mixin).__mixinApplications = mixinApplications;
    }
    // maintain a unique id for each mixin
    let mixinDedupeId = dedupeId++;
    function dedupingMixin(base) {
      let baseSet = /** @type {!MixinFunction} */(base).__mixinSet;
      if (baseSet && baseSet[mixinDedupeId]) {
        return base;
      }
      let map = mixinApplications;
      let extended = map.get(base);
      if (!extended) {
        extended = /** @type {!Function} */(mixin)(base);
        map.set(base, extended);
      }
      // copy inherited mixin set from the extended class, or the base class
      // NOTE: we avoid use of Set here because some browser (IE11)
      // cannot extend a base Set via the constructor.
      let mixinSet = Object.create(/** @type {!MixinFunction} */(extended).__mixinSet || baseSet || null);
      mixinSet[mixinDedupeId] = true;
      /** @type {!MixinFunction} */(extended).__mixinSet = mixinSet;
      return extended;
    }

    return dedupingMixin;
  };
  /* eslint-enable valid-jsdoc */

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  // Microtask implemented using Mutation Observer
  let microtaskCurrHandle = 0;
  let microtaskLastHandle = 0;
  let microtaskCallbacks = [];
  let microtaskNodeContent = 0;
  let microtaskNode = document.createTextNode('');
  new window.MutationObserver(microtaskFlush).observe(microtaskNode, {characterData: true});

  function microtaskFlush() {
    const len = microtaskCallbacks.length;
    for (let i = 0; i < len; i++) {
      let cb = microtaskCallbacks[i];
      if (cb) {
        try {
          cb();
        } catch (e) {
          setTimeout(() => { throw e; });
        }
      }
    }
    microtaskCallbacks.splice(0, len);
    microtaskLastHandle += len;
  }

  /**
   * Async interface for enqueuing callbacks that run at microtask timing.
   *
   * Note that microtask timing is achieved via a single `MutationObserver`,
   * and thus callbacks enqueued with this API will all run in a single
   * batch, and not interleaved with other microtasks such as promises.
   * Promises are avoided as an implementation choice for the time being
   * due to Safari bugs that cause Promises to lack microtask guarantees.
   *
   * @namespace
   * @summary Async interface for enqueuing callbacks that run at microtask
   *   timing.
   */
  const microTask = {

    /**
     * Enqueues a function called at microtask timing.
     *
     * @memberof microTask
     * @param {!Function=} callback Callback to run
     * @return {number} Handle used for canceling task
     */
    run(callback) {
      microtaskNode.textContent = microtaskNodeContent++;
      microtaskCallbacks.push(callback);
      return microtaskCurrHandle++;
    },

    /**
     * Cancels a previously enqueued `microTask` callback.
     *
     * @memberof microTask
     * @param {number} handle Handle returned from `run` of callback to cancel
     * @return {void}
     */
    cancel(handle) {
      const idx = handle - microtaskLastHandle;
      if (idx >= 0) {
        if (!microtaskCallbacks[idx]) {
          throw new Error('invalid async handle: ' + handle);
        }
        microtaskCallbacks[idx] = null;
      }
    }

  };

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /** @const {!AsyncInterface} */
  const microtask = microTask;

  /**
   * Element class mixin that provides basic meta-programming for creating one
   * or more property accessors (getter/setter pair) that enqueue an async
   * (batched) `_propertiesChanged` callback.
   *
   * For basic usage of this mixin, call `MyClass.createProperties(props)`
   * once at class definition time to create property accessors for properties
   * named in props, implement `_propertiesChanged` to react as desired to
   * property changes, and implement `static get observedAttributes()` and
   * include lowercase versions of any property names that should be set from
   * attributes. Last, call `this._enableProperties()` in the element's
   * `connectedCallback` to enable the accessors.
   *
   * @mixinFunction
   * @polymer
   * @summary Element class mixin for reacting to property changes from
   *   generated property accessors.
   */
  const PropertiesChanged = dedupingMixin(
      /**
       * @template T
       * @param {function(new:T)} superClass Class to apply mixin to.
       * @return {function(new:T)} superClass with mixin applied.
       */
      (superClass) => {

    /**
     * @polymer
     * @mixinClass
     * @implements {Polymer_PropertiesChanged}
     * @unrestricted
     */
    class PropertiesChanged extends superClass {

      /**
       * Creates property accessors for the given property names.
       * @param {!Object} props Object whose keys are names of accessors.
       * @return {void}
       * @protected
       */
      static createProperties(props) {
        const proto = this.prototype;
        for (let prop in props) {
          // don't stomp an existing accessor
          if (!(prop in proto)) {
            proto._createPropertyAccessor(prop);
          }
        }
      }

      /**
       * Returns an attribute name that corresponds to the given property.
       * The attribute name is the lowercased property name. Override to
       * customize this mapping.
       * @param {string} property Property to convert
       * @return {string} Attribute name corresponding to the given property.
       *
       * @protected
       */
      static attributeNameForProperty(property) {
        return property.toLowerCase();
      }

      /**
       * Override point to provide a type to which to deserialize a value to
       * a given property.
       * @param {string} name Name of property
       *
       * @protected
       */
      static typeForProperty(name) { } //eslint-disable-line no-unused-vars

      /**
       * Creates a setter/getter pair for the named property with its own
       * local storage.  The getter returns the value in the local storage,
       * and the setter calls `_setProperty`, which updates the local storage
       * for the property and enqueues a `_propertiesChanged` callback.
       *
       * This method may be called on a prototype or an instance.  Calling
       * this method may overwrite a property value that already exists on
       * the prototype/instance by creating the accessor.
       *
       * @param {string} property Name of the property
       * @param {boolean=} readOnly When true, no setter is created; the
       *   protected `_setProperty` function must be used to set the property
       * @return {void}
       * @protected
       * @override
       */
      _createPropertyAccessor(property, readOnly) {
        this._addPropertyToAttributeMap(property);
        if (!this.hasOwnProperty('__dataHasAccessor')) {
          this.__dataHasAccessor = Object.assign({}, this.__dataHasAccessor);
        }
        if (!this.__dataHasAccessor[property]) {
          this.__dataHasAccessor[property] = true;
          this._definePropertyAccessor(property, readOnly);
        }
      }

      /**
       * Adds the given `property` to a map matching attribute names
       * to property names, using `attributeNameForProperty`. This map is
       * used when deserializing attribute values to properties.
       *
       * @param {string} property Name of the property
       * @override
       */
      _addPropertyToAttributeMap(property) {
        if (!this.hasOwnProperty('__dataAttributes')) {
          this.__dataAttributes = Object.assign({}, this.__dataAttributes);
        }
        if (!this.__dataAttributes[property]) {
          const attr = this.constructor.attributeNameForProperty(property);
          this.__dataAttributes[attr] = property;
        }
      }

      /**
       * Defines a property accessor for the given property.
       * @param {string} property Name of the property
       * @param {boolean=} readOnly When true, no setter is created
       * @return {void}
       * @override
       */
       _definePropertyAccessor(property, readOnly) {
        Object.defineProperty(this, property, {
          /* eslint-disable valid-jsdoc */
          /** @this {PropertiesChanged} */
          get() {
            return this._getProperty(property);
          },
          /** @this {PropertiesChanged} */
          set: readOnly ? function () {} : function (value) {
            this._setProperty(property, value);
          }
          /* eslint-enable */
        });
      }

      constructor() {
        super();
        this.__dataEnabled = false;
        this.__dataReady = false;
        this.__dataInvalid = false;
        this.__data = {};
        this.__dataPending = null;
        this.__dataOld = null;
        this.__dataInstanceProps = null;
        this.__serializing = false;
        this._initializeProperties();
      }

      /**
       * Lifecycle callback called when properties are enabled via
       * `_enableProperties`.
       *
       * Users may override this function to implement behavior that is
       * dependent on the element having its property data initialized, e.g.
       * from defaults (initialized from `constructor`, `_initializeProperties`),
       * `attributeChangedCallback`, or values propagated from host e.g. via
       * bindings.  `super.ready()` must be called to ensure the data system
       * becomes enabled.
       *
       * @return {void}
       * @public
       * @override
       */
      ready() {
        this.__dataReady = true;
        this._flushProperties();
      }

      /**
       * Initializes the local storage for property accessors.
       *
       * Provided as an override point for performing any setup work prior
       * to initializing the property accessor system.
       *
       * @return {void}
       * @protected
       * @override
       */
      _initializeProperties() {
        // Capture instance properties; these will be set into accessors
        // during first flush. Don't set them here, since we want
        // these to overwrite defaults/constructor assignments
        for (let p in this.__dataHasAccessor) {
          if (this.hasOwnProperty(p)) {
            this.__dataInstanceProps = this.__dataInstanceProps || {};
            this.__dataInstanceProps[p] = this[p];
            delete this[p];
          }
        }
      }

      /**
       * Called at ready time with bag of instance properties that overwrote
       * accessors when the element upgraded.
       *
       * The default implementation sets these properties back into the
       * setter at ready time.  This method is provided as an override
       * point for customizing or providing more efficient initialization.
       *
       * @param {Object} props Bag of property values that were overwritten
       *   when creating property accessors.
       * @return {void}
       * @protected
       * @override
       */
      _initializeInstanceProperties(props) {
        Object.assign(this, props);
      }

      /**
       * Updates the local storage for a property (via `_setPendingProperty`)
       * and enqueues a `_proeprtiesChanged` callback.
       *
       * @param {string} property Name of the property
       * @param {*} value Value to set
       * @return {void}
       * @protected
       * @override
       */
      _setProperty(property, value) {
        if (this._setPendingProperty(property, value)) {
          this._invalidateProperties();
        }
      }

      /**
       * Returns the value for the given property.
       * @param {string} property Name of property
       * @return {*} Value for the given property
       * @protected
       * @override
       */
      _getProperty(property) {
        return this.__data[property];
      }

      /* eslint-disable no-unused-vars */
      /**
       * Updates the local storage for a property, records the previous value,
       * and adds it to the set of "pending changes" that will be passed to the
       * `_propertiesChanged` callback.  This method does not enqueue the
       * `_propertiesChanged` callback.
       *
       * @param {string} property Name of the property
       * @param {*} value Value to set
       * @param {boolean=} ext Not used here; affordance for closure
       * @return {boolean} Returns true if the property changed
       * @protected
       * @override
       */
      _setPendingProperty(property, value, ext) {
        let old = this.__data[property];
        let changed = this._shouldPropertyChange(property, value, old);
        if (changed) {
          if (!this.__dataPending) {
            this.__dataPending = {};
            this.__dataOld = {};
          }
          // Ensure old is captured from the last turn
          if (this.__dataOld && !(property in this.__dataOld)) {
            this.__dataOld[property] = old;
          }
          this.__data[property] = value;
          this.__dataPending[property] = value;
        }
        return changed;
      }
      /* eslint-enable */

      /**
       * Marks the properties as invalid, and enqueues an async
       * `_propertiesChanged` callback.
       *
       * @return {void}
       * @protected
       * @override
       */
      _invalidateProperties() {
        if (!this.__dataInvalid && this.__dataReady) {
          this.__dataInvalid = true;
          microtask.run(() => {
            if (this.__dataInvalid) {
              this.__dataInvalid = false;
              this._flushProperties();
            }
          });
        }
      }

      /**
       * Call to enable property accessor processing. Before this method is
       * called accessor values will be set but side effects are
       * queued. When called, any pending side effects occur immediately.
       * For elements, generally `connectedCallback` is a normal spot to do so.
       * It is safe to call this method multiple times as it only turns on
       * property accessors once.
       *
       * @return {void}
       * @protected
       * @override
       */
      _enableProperties() {
        if (!this.__dataEnabled) {
          this.__dataEnabled = true;
          if (this.__dataInstanceProps) {
            this._initializeInstanceProperties(this.__dataInstanceProps);
            this.__dataInstanceProps = null;
          }
          this.ready();
        }
      }

      /**
       * Calls the `_propertiesChanged` callback with the current set of
       * pending changes (and old values recorded when pending changes were
       * set), and resets the pending set of changes. Generally, this method
       * should not be called in user code.
       *
       * @return {void}
       * @protected
       * @override
       */
      _flushProperties() {
        const props = this.__data;
        const changedProps = this.__dataPending;
        const old = this.__dataOld;
        if (this._shouldPropertiesChange(props, changedProps, old)) {
          this.__dataPending = null;
          this.__dataOld = null;
          this._propertiesChanged(props, changedProps, old);
        }
      }

      /**
       * Called in `_flushProperties` to determine if `_propertiesChanged`
       * should be called. The default implementation returns true if
       * properties are pending. Override to customize when
       * `_propertiesChanged` is called.
       * @param {!Object} currentProps Bag of all current accessor values
       * @param {?Object} changedProps Bag of properties changed since the last
       *   call to `_propertiesChanged`
       * @param {?Object} oldProps Bag of previous values for each property
       *   in `changedProps`
       * @return {boolean} true if changedProps is truthy
       * @override
       */
      _shouldPropertiesChange(currentProps, changedProps, oldProps) { // eslint-disable-line no-unused-vars
        return Boolean(changedProps);
      }

      /**
       * Callback called when any properties with accessors created via
       * `_createPropertyAccessor` have been set.
       *
       * @param {!Object} currentProps Bag of all current accessor values
       * @param {?Object} changedProps Bag of properties changed since the last
       *   call to `_propertiesChanged`
       * @param {?Object} oldProps Bag of previous values for each property
       *   in `changedProps`
       * @return {void}
       * @protected
       * @override
       */
      _propertiesChanged(currentProps, changedProps, oldProps) { // eslint-disable-line no-unused-vars
      }

      /**
       * Method called to determine whether a property value should be
       * considered as a change and cause the `_propertiesChanged` callback
       * to be enqueued.
       *
       * The default implementation returns `true` if a strict equality
       * check fails. The method always returns false for `NaN`.
       *
       * Override this method to e.g. provide stricter checking for
       * Objects/Arrays when using immutable patterns.
       *
       * @param {string} property Property name
       * @param {*} value New property value
       * @param {*} old Previous property value
       * @return {boolean} Whether the property should be considered a change
       *   and enqueue a `_proeprtiesChanged` callback
       * @protected
       * @override
       */
      _shouldPropertyChange(property, value, old) {
        return (
          // Strict equality check
          (old !== value &&
            // This ensures (old==NaN, value==NaN) always returns false
            (old === old || value === value))
        );
      }

      /**
       * Implements native Custom Elements `attributeChangedCallback` to
       * set an attribute value to a property via `_attributeToProperty`.
       *
       * @param {string} name Name of attribute that changed
       * @param {?string} old Old attribute value
       * @param {?string} value New attribute value
       * @param {?string} namespace Attribute namespace.
       * @return {void}
       * @suppress {missingProperties} Super may or may not implement the callback
       * @override
       */
      attributeChangedCallback(name, old, value, namespace) {
        if (old !== value) {
          this._attributeToProperty(name, value);
        }
        if (super.attributeChangedCallback) {
          super.attributeChangedCallback(name, old, value, namespace);
        }
      }

      /**
       * Deserializes an attribute to its associated property.
       *
       * This method calls the `_deserializeValue` method to convert the string to
       * a typed value.
       *
       * @param {string} attribute Name of attribute to deserialize.
       * @param {?string} value of the attribute.
       * @param {*=} type type to deserialize to, defaults to the value
       * returned from `typeForProperty`
       * @return {void}
       * @override
       */
      _attributeToProperty(attribute, value, type) {
        if (!this.__serializing) {
          const map = this.__dataAttributes;
          const property = map && map[attribute] || attribute;
          this[property] = this._deserializeValue(value, type ||
            this.constructor.typeForProperty(property));
        }
      }

      /**
       * Serializes a property to its associated attribute.
       *
       * @suppress {invalidCasts} Closure can't figure out `this` is an element.
       *
       * @param {string} property Property name to reflect.
       * @param {string=} attribute Attribute name to reflect to.
       * @param {*=} value Property value to refect.
       * @return {void}
       * @override
       */
      _propertyToAttribute(property, attribute, value) {
        this.__serializing = true;
        value = (arguments.length < 3) ? this[property] : value;
        this._valueToNodeAttribute(/** @type {!HTMLElement} */(this), value,
          attribute || this.constructor.attributeNameForProperty(property));
        this.__serializing = false;
      }

      /**
       * Sets a typed value to an HTML attribute on a node.
       *
       * This method calls the `_serializeValue` method to convert the typed
       * value to a string.  If the `_serializeValue` method returns `undefined`,
       * the attribute will be removed (this is the default for boolean
       * type `false`).
       *
       * @param {Element} node Element to set attribute to.
       * @param {*} value Value to serialize.
       * @param {string} attribute Attribute name to serialize to.
       * @return {void}
       * @override
       */
      _valueToNodeAttribute(node, value, attribute) {
        const str = this._serializeValue(value);
        if (str === undefined) {
          node.removeAttribute(attribute);
        } else {
          node.setAttribute(attribute, str);
        }
      }

      /**
       * Converts a typed JavaScript value to a string.
       *
       * This method is called when setting JS property values to
       * HTML attributes.  Users may override this method to provide
       * serialization for custom types.
       *
       * @param {*} value Property value to serialize.
       * @return {string | undefined} String serialized from the provided
       * property  value.
       * @override
       */
      _serializeValue(value) {
        switch (typeof value) {
          case 'boolean':
            return value ? '' : undefined;
          default:
            return value != null ? value.toString() : undefined;
        }
      }

      /**
       * Converts a string to a typed JavaScript value.
       *
       * This method is called when reading HTML attribute values to
       * JS properties.  Users may override this method to provide
       * deserialization for custom `type`s. Types for `Boolean`, `String`,
       * and `Number` convert attributes to the expected types.
       *
       * @param {?string} value Value to deserialize.
       * @param {*=} type Type to deserialize the string to.
       * @return {*} Typed value deserialized from the provided string.
       * @override
       */
      _deserializeValue(value, type) {
        switch (type) {
          case Boolean:
            return (value !== null);
          case Number:
            return Number(value);
          default:
            return value;
        }
      }

    }

    return PropertiesChanged;
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * Creates a copy of `props` with each property normalized such that
   * upgraded it is an object with at least a type property { type: Type}.
   *
   * @param {Object} props Properties to normalize
   * @return {Object} Copy of input `props` with normalized properties that
   * are in the form {type: Type}
   * @private
   */
  function normalizeProperties(props) {
    const output = {};
    for (let p in props) {
      const o = props[p];
      output[p] = (typeof o === 'function') ? {type: o} : o;
    }
    return output;
  }

  /**
   * Mixin that provides a minimal starting point to using the PropertiesChanged
   * mixin by providing a mechanism to declare properties in a static
   * getter (e.g. static get properties() { return { foo: String } }). Changes
   * are reported via the `_propertiesChanged` method.
   *
   * This mixin provides no specific support for rendering. Users are expected
   * to create a ShadowRoot and put content into it and update it in whatever
   * way makes sense. This can be done in reaction to properties changing by
   * implementing `_propertiesChanged`.
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin PropertiesChanged
   * @summary Mixin that provides a minimal starting point for using
   * the PropertiesChanged mixin by providing a declarative `properties` object.
   */
  const PropertiesMixin = dedupingMixin(superClass => {

   /**
    * @constructor
    * @implements {Polymer_PropertiesChanged}
    * @private
    */
   const base = PropertiesChanged(superClass);

   /**
    * Returns the super class constructor for the given class, if it is an
    * instance of the PropertiesMixin.
    *
    * @param {!PropertiesMixinConstructor} constructor PropertiesMixin constructor
    * @return {?PropertiesMixinConstructor} Super class constructor
    */
   function superPropertiesClass(constructor) {
     const superCtor = Object.getPrototypeOf(constructor);

     // Note, the `PropertiesMixin` class below only refers to the class
     // generated by this call to the mixin; the instanceof test only works
     // because the mixin is deduped and guaranteed only to apply once, hence
     // all constructors in a proto chain will see the same `PropertiesMixin`
     return (superCtor.prototype instanceof PropertiesMixin) ?
       /** @type {!PropertiesMixinConstructor} */ (superCtor) : null;
   }

   /**
    * Returns a memoized version of the `properties` object for the
    * given class. Properties not in object format are converted to at
    * least {type}.
    *
    * @param {PropertiesMixinConstructor} constructor PropertiesMixin constructor
    * @return {Object} Memoized properties object
    */
   function ownProperties(constructor) {
     if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownProperties', constructor))) {
       let props = null;

       if (constructor.hasOwnProperty(JSCompiler_renameProperty('properties', constructor)) && constructor.properties) {
         props = normalizeProperties(constructor.properties);
       }

       constructor.__ownProperties = props;
     }
     return constructor.__ownProperties;
   }

   /**
    * @polymer
    * @mixinClass
    * @extends {base}
    * @implements {Polymer_PropertiesMixin}
    * @unrestricted
    */
   class PropertiesMixin extends base {

     /**
      * Implements standard custom elements getter to observes the attributes
      * listed in `properties`.
      * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
      */
     static get observedAttributes() {
       const props = this._properties;
       return props ? Object.keys(props).map(p => this.attributeNameForProperty(p)) : [];
     }

     /**
      * Finalizes an element definition, including ensuring any super classes
      * are also finalized. This includes ensuring property
      * accessors exist on the element prototype. This method calls
      * `_finalizeClass` to finalize each constructor in the prototype chain.
      * @return {void}
      */
     static finalize() {
       if (!this.hasOwnProperty(JSCompiler_renameProperty('__finalized', this))) {
         const superCtor = superPropertiesClass(/** @type {!PropertiesMixinConstructor} */(this));
         if (superCtor) {
           superCtor.finalize();
         }
         this.__finalized = true;
         this._finalizeClass();
       }
     }

     /**
      * Finalize an element class. This includes ensuring property
      * accessors exist on the element prototype. This method is called by
      * `finalize` and finalizes the class constructor.
      *
      * @protected
      */
     static _finalizeClass() {
       const props = ownProperties(/** @type {!PropertiesMixinConstructor} */(this));
       if (props) {
         this.createProperties(props);
       }
     }

     /**
      * Returns a memoized version of all properties, including those inherited
      * from super classes. Properties not in object format are converted to
      * at least {type}.
      *
      * @return {Object} Object containing properties for this class
      * @protected
      */
     static get _properties() {
       if (!this.hasOwnProperty(
         JSCompiler_renameProperty('__properties', this))) {
         const superCtor = superPropertiesClass(/** @type {!PropertiesMixinConstructor} */(this));
         this.__properties = Object.assign({},
           superCtor && superCtor._properties,
           ownProperties(/** @type {PropertiesMixinConstructor} */(this)));
       }
       return this.__properties;
     }

     /**
      * Overrides `PropertiesChanged` method to return type specified in the
      * static `properties` object for the given property.
      * @param {string} name Name of property
      * @return {*} Type to which to deserialize attribute
      *
      * @protected
      */
     static typeForProperty(name) {
       const info = this._properties[name];
       return info && info.type;
     }

     /**
      * Overrides `PropertiesChanged` method and adds a call to
      * `finalize` which lazily configures the element's property accessors.
      * @override
      * @return {void}
      */
     _initializeProperties() {
       this.constructor.finalize();
       super._initializeProperties();
     }

     /**
      * Called when the element is added to a document.
      * Calls `_enableProperties` to turn on property system from
      * `PropertiesChanged`.
      * @suppress {missingProperties} Super may or may not implement the callback
      * @return {void}
      * @override
      */
     connectedCallback() {
       if (super.connectedCallback) {
         super.connectedCallback();
       }
       this._enableProperties();
     }

     /**
      * Called when the element is removed from a document
      * @suppress {missingProperties} Super may or may not implement the callback
      * @return {void}
      * @override
      */
     disconnectedCallback() {
       if (super.disconnectedCallback) {
         super.disconnectedCallback();
       }
     }

   }

   return PropertiesMixin;

  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // The first argument to JS template tags retain identity across multiple
  // calls to a tag for the same literal, so we can cache work done per literal
  // in a Map.
  const templateCaches = new Map();
  /**
   * The return type of `html`, which holds a Template and the values from
   * interpolated expressions.
   */
  class TemplateResult {
      constructor(strings, values, type, partCallback = defaultPartCallback) {
          this.strings = strings;
          this.values = values;
          this.type = type;
          this.partCallback = partCallback;
      }
      /**
       * Returns a string of HTML used to create a <template> element.
       */
      getHTML() {
          const l = this.strings.length - 1;
          let html = '';
          let isTextBinding = true;
          for (let i = 0; i < l; i++) {
              const s = this.strings[i];
              html += s;
              // We're in a text position if the previous string closed its tags.
              // If it doesn't have any tags, then we use the previous text position
              // state.
              const closing = findTagClose(s);
              isTextBinding = closing > -1 ? closing < s.length : isTextBinding;
              html += isTextBinding ? nodeMarker : marker;
          }
          html += this.strings[l];
          return html;
      }
      getTemplateElement() {
          const template = document.createElement('template');
          template.innerHTML = this.getHTML();
          return template;
      }
  }
  /**
   * An expression marker with embedded unique key to avoid collision with
   * possible text in templates.
   */
  const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
  /**
   * An expression marker used text-positions, not attribute positions,
   * in template.
   */
  const nodeMarker = `<!--${marker}-->`;
  const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
  /**
   * This regex extracts the attribute name preceding an attribute-position
   * expression. It does this by matching the syntax allowed for attributes
   * against the string literal directly preceding the expression, assuming that
   * the expression is in an attribute-value position.
   *
   * See attributes in the HTML spec:
   * https://www.w3.org/TR/html5/syntax.html#attributes-0
   *
   * "\0-\x1F\x7F-\x9F" are Unicode control characters
   *
   * " \x09\x0a\x0c\x0d" are HTML space characters:
   * https://www.w3.org/TR/html5/infrastructure.html#space-character
   *
   * So an attribute is:
   *  * The name: any character except a control character, space character, ('),
   *    ("), ">", "=", or "/"
   *  * Followed by zero or more space characters
   *  * Followed by "="
   *  * Followed by zero or more space characters
   *  * Followed by:
   *    * Any character except space, ('), ("), "<", ">", "=", (`), or
   *    * (") then any non-("), or
   *    * (') then any non-(')
   */
  const lastAttributeNameRegex = /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;
  /**
   * Finds the closing index of the last closed HTML tag.
   * This has 3 possible return values:
   *   - `-1`, meaning there is no tag in str.
   *   - `string.length`, meaning the last opened tag is unclosed.
   *   - Some positive number < str.length, meaning the index of the closing '>'.
   */
  function findTagClose(str) {
      const close = str.lastIndexOf('>');
      const open = str.indexOf('<', close + 1);
      return open > -1 ? str.length : close;
  }
  /**
   * A placeholder for a dynamic expression in an HTML template.
   *
   * There are two built-in part types: AttributePart and NodePart. NodeParts
   * always represent a single dynamic expression, while AttributeParts may
   * represent as many expressions are contained in the attribute.
   *
   * A Template's parts are mutable, so parts can be replaced or modified
   * (possibly to implement different template semantics). The contract is that
   * parts can only be replaced, not removed, added or reordered, and parts must
   * always consume the correct number of values in their `update()` method.
   *
   * TODO(justinfagnani): That requirement is a little fragile. A
   * TemplateInstance could instead be more careful about which values it gives
   * to Part.update().
   */
  class TemplatePart {
      constructor(type, index, name, rawName, strings) {
          this.type = type;
          this.index = index;
          this.name = name;
          this.rawName = rawName;
          this.strings = strings;
      }
  }
  const isTemplatePartActive = (part) => part.index !== -1;
  /**
   * An updateable Template that tracks the location of dynamic parts.
   */
  class Template {
      constructor(result, element) {
          this.parts = [];
          this.element = element;
          const content = this.element.content;
          // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
          const walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                 NodeFilter.SHOW_TEXT */, null, false);
          let index = -1;
          let partIndex = 0;
          const nodesToRemove = [];
          // The actual previous node, accounting for removals: if a node is removed
          // it will never be the previousNode.
          let previousNode;
          // Used to set previousNode at the top of the loop.
          let currentNode;
          while (walker.nextNode()) {
              index++;
              previousNode = currentNode;
              const node = currentNode = walker.currentNode;
              if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                  if (!node.hasAttributes()) {
                      continue;
                  }
                  const attributes = node.attributes;
                  // Per https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                  // attributes are not guaranteed to be returned in document order. In
                  // particular, Edge/IE can return them out of order, so we cannot assume
                  // a correspondance between part index and attribute index.
                  let count = 0;
                  for (let i = 0; i < attributes.length; i++) {
                      if (attributes[i].value.indexOf(marker) >= 0) {
                          count++;
                      }
                  }
                  while (count-- > 0) {
                      // Get the template literal section leading up to the first
                      // expression in this attribute
                      const stringForPart = result.strings[partIndex];
                      // Find the attribute name
                      const attributeNameInPart = lastAttributeNameRegex.exec(stringForPart)[1];
                      // Find the corresponding attribute
                      // TODO(justinfagnani): remove non-null assertion
                      const attribute = attributes.getNamedItem(attributeNameInPart);
                      const stringsForAttributeValue = attribute.value.split(markerRegex);
                      this.parts.push(new TemplatePart('attribute', index, attribute.name, attributeNameInPart, stringsForAttributeValue));
                      node.removeAttribute(attribute.name);
                      partIndex += stringsForAttributeValue.length - 1;
                  }
              }
              else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                  const nodeValue = node.nodeValue;
                  if (nodeValue.indexOf(marker) < 0) {
                      continue;
                  }
                  const parent = node.parentNode;
                  const strings = nodeValue.split(markerRegex);
                  const lastIndex = strings.length - 1;
                  // We have a part for each match found
                  partIndex += lastIndex;
                  // Generate a new text node for each literal section
                  // These nodes are also used as the markers for node parts
                  for (let i = 0; i < lastIndex; i++) {
                      parent.insertBefore((strings[i] === '')
                          ? document.createComment('')
                          : document.createTextNode(strings[i]), node);
                      this.parts.push(new TemplatePart('node', index++));
                  }
                  parent.insertBefore(strings[lastIndex] === '' ?
                      document.createComment('') :
                      document.createTextNode(strings[lastIndex]), node);
                  nodesToRemove.push(node);
              }
              else if (node.nodeType === 8 /* Node.COMMENT_NODE */ &&
                  node.nodeValue === marker) {
                  const parent = node.parentNode;
                  // Add a new marker node to be the startNode of the Part if any of the
                  // following are true:
                  //  * We don't have a previousSibling
                  //  * previousSibling is being removed (thus it's not the
                  //    `previousNode`)
                  //  * previousSibling is not a Text node
                  //
                  // TODO(justinfagnani): We should be able to use the previousNode here
                  // as the marker node and reduce the number of extra nodes we add to a
                  // template. See https://github.com/PolymerLabs/lit-html/issues/147
                  const previousSibling = node.previousSibling;
                  if (previousSibling === null || previousSibling !== previousNode ||
                      previousSibling.nodeType !== Node.TEXT_NODE) {
                      parent.insertBefore(document.createComment(''), node);
                  }
                  else {
                      index--;
                  }
                  this.parts.push(new TemplatePart('node', index++));
                  nodesToRemove.push(node);
                  // If we don't have a nextSibling add a marker node.
                  // We don't have to check if the next node is going to be removed,
                  // because that node will induce a new marker if so.
                  if (node.nextSibling === null) {
                      parent.insertBefore(document.createComment(''), node);
                  }
                  else {
                      index--;
                  }
                  currentNode = previousNode;
                  partIndex++;
              }
          }
          // Remove text binding nodes after the walk to not disturb the TreeWalker
          for (const n of nodesToRemove) {
              n.parentNode.removeChild(n);
          }
      }
  }
  /**
   * Returns a value ready to be inserted into a Part from a user-provided value.
   *
   * If the user value is a directive, this invokes the directive with the given
   * part. If the value is null, it's converted to undefined to work better
   * with certain DOM APIs, like textContent.
   */
  const getValue = (part, value) => {
      // `null` as the value of a Text node will render the string 'null'
      // so we convert it to undefined
      if (isDirective(value)) {
          value = value(part);
          return noChange;
      }
      return value === null ? undefined : value;
  };
  const isDirective = (o) => typeof o === 'function' && o.__litDirective === true;
  /**
   * A sentinel value that signals that a value was handled by a directive and
   * should not be written to the DOM.
   */
  const noChange = {};
  const isPrimitiveValue = (value) => value === null ||
      !(typeof value === 'object' || typeof value === 'function');
  class AttributePart {
      constructor(instance, element, name, strings) {
          this.instance = instance;
          this.element = element;
          this.name = name;
          this.strings = strings;
          this.size = strings.length - 1;
          this._previousValues = [];
      }
      _interpolate(values, startIndex) {
          const strings = this.strings;
          const l = strings.length - 1;
          let text = '';
          for (let i = 0; i < l; i++) {
              text += strings[i];
              const v = getValue(this, values[startIndex + i]);
              if (v && v !== noChange &&
                  (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
                  for (const t of v) {
                      // TODO: we need to recursively call getValue into iterables...
                      text += t;
                  }
              }
              else {
                  text += v;
              }
          }
          return text + strings[l];
      }
      _equalToPreviousValues(values, startIndex) {
          for (let i = startIndex; i < startIndex + this.size; i++) {
              if (this._previousValues[i] !== values[i] ||
                  !isPrimitiveValue(values[i])) {
                  return false;
              }
          }
          return true;
      }
      setValue(values, startIndex) {
          if (this._equalToPreviousValues(values, startIndex)) {
              return;
          }
          const s = this.strings;
          let value;
          if (s.length === 2 && s[0] === '' && s[1] === '') {
              // An expression that occupies the whole attribute value will leave
              // leading and trailing empty strings.
              value = getValue(this, values[startIndex]);
              if (Array.isArray(value)) {
                  value = value.join('');
              }
          }
          else {
              value = this._interpolate(values, startIndex);
          }
          if (value !== noChange) {
              this.element.setAttribute(this.name, value);
          }
          this._previousValues = values;
      }
  }
  class NodePart {
      constructor(instance, startNode, endNode) {
          this.instance = instance;
          this.startNode = startNode;
          this.endNode = endNode;
          this._previousValue = undefined;
      }
      setValue(value) {
          value = getValue(this, value);
          if (value === noChange) {
              return;
          }
          if (isPrimitiveValue(value)) {
              // Handle primitive values
              // If the value didn't change, do nothing
              if (value === this._previousValue) {
                  return;
              }
              this._setText(value);
          }
          else if (value instanceof TemplateResult) {
              this._setTemplateResult(value);
          }
          else if (Array.isArray(value) || value[Symbol.iterator]) {
              this._setIterable(value);
          }
          else if (value instanceof Node) {
              this._setNode(value);
          }
          else if (value.then !== undefined) {
              this._setPromise(value);
          }
          else {
              // Fallback, will render the string representation
              this._setText(value);
          }
      }
      _insert(node) {
          this.endNode.parentNode.insertBefore(node, this.endNode);
      }
      _setNode(value) {
          if (this._previousValue === value) {
              return;
          }
          this.clear();
          this._insert(value);
          this._previousValue = value;
      }
      _setText(value) {
          const node = this.startNode.nextSibling;
          value = value === undefined ? '' : value;
          if (node === this.endNode.previousSibling &&
              node.nodeType === Node.TEXT_NODE) {
              // If we only have a single text node between the markers, we can just
              // set its value, rather than replacing it.
              // TODO(justinfagnani): Can we just check if _previousValue is
              // primitive?
              node.textContent = value;
          }
          else {
              this._setNode(document.createTextNode(value));
          }
          this._previousValue = value;
      }
      _setTemplateResult(value) {
          const template = this.instance._getTemplate(value);
          let instance;
          if (this._previousValue && this._previousValue.template === template) {
              instance = this._previousValue;
          }
          else {
              instance = new TemplateInstance(template, this.instance._partCallback, this.instance._getTemplate);
              this._setNode(instance._clone());
              this._previousValue = instance;
          }
          instance.update(value.values);
      }
      _setIterable(value) {
          // For an Iterable, we create a new InstancePart per item, then set its
          // value to the item. This is a little bit of overhead for every item in
          // an Iterable, but it lets us recurse easily and efficiently update Arrays
          // of TemplateResults that will be commonly returned from expressions like:
          // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
          // If _previousValue is an array, then the previous render was of an
          // iterable and _previousValue will contain the NodeParts from the previous
          // render. If _previousValue is not an array, clear this part and make a new
          // array for NodeParts.
          if (!Array.isArray(this._previousValue)) {
              this.clear();
              this._previousValue = [];
          }
          // Lets us keep track of how many items we stamped so we can clear leftover
          // items from a previous render
          const itemParts = this._previousValue;
          let partIndex = 0;
          for (const item of value) {
              // Try to reuse an existing part
              let itemPart = itemParts[partIndex];
              // If no existing part, create a new one
              if (itemPart === undefined) {
                  // If we're creating the first item part, it's startNode should be the
                  // container's startNode
                  let itemStart = this.startNode;
                  // If we're not creating the first part, create a new separator marker
                  // node, and fix up the previous part's endNode to point to it
                  if (partIndex > 0) {
                      const previousPart = itemParts[partIndex - 1];
                      itemStart = previousPart.endNode = document.createTextNode('');
                      this._insert(itemStart);
                  }
                  itemPart = new NodePart(this.instance, itemStart, this.endNode);
                  itemParts.push(itemPart);
              }
              itemPart.setValue(item);
              partIndex++;
          }
          if (partIndex === 0) {
              this.clear();
              this._previousValue = undefined;
          }
          else if (partIndex < itemParts.length) {
              const lastPart = itemParts[partIndex - 1];
              // Truncate the parts array so _previousValue reflects the current state
              itemParts.length = partIndex;
              this.clear(lastPart.endNode.previousSibling);
              lastPart.endNode = this.endNode;
          }
      }
      _setPromise(value) {
          this._previousValue = value;
          value.then((v) => {
              if (this._previousValue === value) {
                  this.setValue(v);
              }
          });
      }
      clear(startNode = this.startNode) {
          removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
      }
  }
  const defaultPartCallback = (instance, templatePart, node) => {
      if (templatePart.type === 'attribute') {
          return new AttributePart(instance, node, templatePart.name, templatePart.strings);
      }
      else if (templatePart.type === 'node') {
          return new NodePart(instance, node, node.nextSibling);
      }
      throw new Error(`Unknown part type ${templatePart.type}`);
  };
  /**
   * An instance of a `Template` that can be attached to the DOM and updated
   * with new values.
   */
  class TemplateInstance {
      constructor(template, partCallback, getTemplate) {
          this._parts = [];
          this.template = template;
          this._partCallback = partCallback;
          this._getTemplate = getTemplate;
      }
      update(values) {
          let valueIndex = 0;
          for (const part of this._parts) {
              if (!part) {
                  valueIndex++;
              }
              else if (part.size === undefined) {
                  part.setValue(values[valueIndex]);
                  valueIndex++;
              }
              else {
                  part.setValue(values, valueIndex);
                  valueIndex += part.size;
              }
          }
      }
      _clone() {
          // Clone the node, rather than importing it, to keep the fragment in the
          // template's document. This leaves the fragment inert so custom elements
          // won't upgrade until after the main document adopts the node.
          const fragment = this.template.element.content.cloneNode(true);
          const parts = this.template.parts;
          if (parts.length > 0) {
              // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
              // null
              const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                     NodeFilter.SHOW_TEXT */, null, false);
              let index = -1;
              for (let i = 0; i < parts.length; i++) {
                  const part = parts[i];
                  const partActive = isTemplatePartActive(part);
                  // An inactive part has no coresponding Template node.
                  if (partActive) {
                      while (index < part.index) {
                          index++;
                          walker.nextNode();
                      }
                  }
                  this._parts.push(partActive ? this._partCallback(this, part, walker.currentNode) : undefined);
              }
          }
          return fragment;
      }
  }
  /**
   * Removes nodes, starting from `startNode` (inclusive) to `endNode`
   * (exclusive), from `container`.
   */
  const removeNodes = (container, startNode, endNode = null) => {
      let node = startNode;
      while (node !== endNode) {
          const n = node.nextSibling;
          container.removeChild(node);
          node = n;
      }
  };

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const walkerNodeFilter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
      NodeFilter.SHOW_TEXT;
  /**
   * Removes the list of nodes from a Template safely. In addition to removing
   * nodes from the Template, the Template part indices are updated to match
   * the mutated Template DOM.
   *
   * As the template is walked the removal state is tracked and
   * part indices are adjusted as needed.
   *
   * div
   *   div#1 (remove) <-- start removing (removing node is div#1)
   *     div
   *       div#2 (remove)  <-- continue removing (removing node is still div#1)
   *         div
   * div <-- stop removing since previous sibling is the removing node (div#1, removed 4 nodes)
   */
  function removeNodesFromTemplate(template, nodesToRemove) {
      const { element: { content }, parts } = template;
      const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
      let partIndex = 0;
      let part = parts[0];
      let nodeIndex = -1;
      let removeCount = 0;
      const nodesToRemoveInTemplate = [];
      let currentRemovingNode = null;
      while (walker.nextNode()) {
          nodeIndex++;
          const node = walker.currentNode;
          // End removal if stepped past the removing node
          if (node.previousSibling === currentRemovingNode) {
              currentRemovingNode = null;
          }
          // A node to remove was found in the template
          if (nodesToRemove.has(node)) {
              nodesToRemoveInTemplate.push(node);
              // Track node we're removing
              if (currentRemovingNode === null) {
                  currentRemovingNode = node;
              }
          }
          // When removing, increment count by which to adjust subsequent part indices
          if (currentRemovingNode !== null) {
              removeCount++;
          }
          while (part !== undefined && part.index === nodeIndex) {
              // If part is in a removed node deactivate it by setting index to -1 or
              // adjust the index as needed.
              part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
              part = parts[++partIndex];
          }
      }
      nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
  }
  const countNodes = (node) => {
      let count = 1;
      const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
      while (walker.nextNode()) {
          count++;
      }
      return count;
  };
  const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
      for (let i = startIndex + 1; i < parts.length; i++) {
          const part = parts[i];
          if (isTemplatePartActive(part)) {
              return i;
          }
      }
      return -1;
  };
  /**
   * Inserts the given node into the Template, optionally before the given
   * refNode. In addition to inserting the node into the Template, the Template
   * part indices are updated to match the mutated Template DOM.
   */
  function insertNodeIntoTemplate(template, node, refNode = null) {
      const { element: { content }, parts } = template;
      // If there's no refNode, then put node at end of template.
      // No part indices need to be shifted in this case.
      if (refNode === null || refNode === undefined) {
          content.appendChild(node);
          return;
      }
      const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
      let partIndex = nextActiveIndexInTemplateParts(parts);
      let insertCount = 0;
      let walkerIndex = -1;
      while (walker.nextNode()) {
          walkerIndex++;
          const walkerNode = walker.currentNode;
          if (walkerNode === refNode) {
              refNode.parentNode.insertBefore(node, refNode);
              insertCount = countNodes(node);
          }
          while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
              // If we've inserted the node, simply adjust all subsequent parts
              if (insertCount > 0) {
                  while (partIndex !== -1) {
                      parts[partIndex].index += insertCount;
                      partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                  }
                  return;
              }
              partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
          }
      }
  }

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // Get a key to lookup in `templateCaches`.
  const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
  /**
   * Template factory which scopes template DOM using ShadyCSS.
   * @param scopeName {string}
   */
  const shadyTemplateFactory = (scopeName) => (result) => {
      const cacheKey = getTemplateCacheKey(result.type, scopeName);
      let templateCache = templateCaches.get(cacheKey);
      if (templateCache === undefined) {
          templateCache = new Map();
          templateCaches.set(cacheKey, templateCache);
      }
      let template = templateCache.get(result.strings);
      if (template === undefined) {
          const element = result.getTemplateElement();
          if (typeof window.ShadyCSS === 'object') {
              window.ShadyCSS.prepareTemplateDom(element, scopeName);
          }
          template = new Template(result, element);
          templateCache.set(result.strings, template);
      }
      return template;
  };
  const TEMPLATE_TYPES = ['html', 'svg'];
  /**
   * Removes all style elements from Templates for the given scopeName.
   */
  function removeStylesFromLitTemplates(scopeName) {
      TEMPLATE_TYPES.forEach((type) => {
          const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
          if (templates !== undefined) {
              templates.forEach((template) => {
                  const { element: { content } } = template;
                  const styles = content.querySelectorAll('style');
                  removeNodesFromTemplate(template, new Set(Array.from(styles)));
              });
          }
      });
  }
  const shadyRenderSet = new Set();
  /**
   * For the given scope name, ensures that ShadyCSS style scoping is performed.
   * This is done just once per scope name so the fragment and template cannot
   * be modified.
   * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
   * to be scoped and appended to the document
   * (2) removes style elements from all lit-html Templates for this scope name.
   *
   * Note, <style> elements can only be placed into templates for the
   * initial rendering of the scope. If <style> elements are included in templates
   * dynamically rendered to the scope (after the first scope render), they will
   * not be scoped and the <style> will be left in the template and rendered output.
   */
  const ensureStylesScoped = (fragment, template, scopeName) => {
      // only scope element template once per scope name
      if (!shadyRenderSet.has(scopeName)) {
          shadyRenderSet.add(scopeName);
          const styleTemplate = document.createElement('template');
          Array.from(fragment.querySelectorAll('style')).forEach((s) => {
              styleTemplate.content.appendChild(s);
          });
          window.ShadyCSS.prepareTemplateStyles(styleTemplate, scopeName);
          // Fix templates: note the expectation here is that the given `fragment`
          // has been generated from the given `template` which contains
          // the set of templates rendered into this scope.
          // It is only from this set of initial templates from which styles
          // will be scoped and removed.
          removeStylesFromLitTemplates(scopeName);
          // ApplyShim case
          if (window.ShadyCSS.nativeShadow) {
              const style = styleTemplate.content.querySelector('style');
              if (style !== null) {
                  // Insert style into rendered fragment
                  fragment.insertBefore(style, fragment.firstChild);
                  // Insert into lit-template (for subsequent renders)
                  insertNodeIntoTemplate(template, style.cloneNode(true), template.element.content.firstChild);
              }
          }
      }
  };
  // NOTE: We're copying code from lit-html's `render` method here.
  // We're doing this explicitly because the API for rendering templates is likely
  // to change in the near term.
  function render$1(result, container, scopeName) {
      const templateFactory = shadyTemplateFactory(scopeName);
      const template = templateFactory(result);
      let instance = container.__templateInstance;
      // Repeat render, just call update()
      if (instance !== undefined && instance.template === template &&
          instance._partCallback === result.partCallback) {
          instance.update(result.values);
          return;
      }
      // First render, create a new TemplateInstance and append it
      instance =
          new TemplateInstance(template, result.partCallback, templateFactory);
      container.__templateInstance = instance;
      const fragment = instance._clone();
      instance.update(result.values);
      const host = container instanceof ShadowRoot ?
          container.host :
          undefined;
      // If there's a shadow host, do ShadyCSS scoping...
      if (host !== undefined && typeof window.ShadyCSS === 'object') {
          ensureStylesScoped(fragment, template, scopeName);
          window.ShadyCSS.styleElement(host);
      }
      removeNodes(container, container.firstChild);
      container.appendChild(fragment);
  }

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * Interprets a template literal as a lit-extended HTML template.
   */
  const html$1 = (strings, ...values) => new TemplateResult(strings, values, 'html', extendedPartCallback);
  /**
   * A PartCallback which allows templates to set properties and declarative
   * event handlers.
   *
   * Properties are set by default, instead of attributes. Attribute names in
   * lit-html templates preserve case, so properties are case sensitive. If an
   * expression takes up an entire attribute value, then the property is set to
   * that value. If an expression is interpolated with a string or other
   * expressions then the property is set to the string result of the
   * interpolation.
   *
   * To set an attribute instead of a property, append a `$` suffix to the
   * attribute name.
   *
   * Example:
   *
   *     html`<button class$="primary">Buy Now</button>`
   *
   * To set an event handler, prefix the attribute name with `on-`:
   *
   * Example:
   *
   *     html`<button on-click=${(e)=> this.onClickHandler(e)}>Buy Now</button>`
   *
   */
  const extendedPartCallback = (instance, templatePart, node) => {
      if (templatePart.type === 'attribute') {
          if (templatePart.rawName.substr(0, 3) === 'on-') {
              const eventName = templatePart.rawName.slice(3);
              return new EventPart(instance, node, eventName);
          }
          const lastChar = templatePart.name.substr(templatePart.name.length - 1);
          if (lastChar === '$') {
              const name = templatePart.name.slice(0, -1);
              return new AttributePart(instance, node, name, templatePart.strings);
          }
          if (lastChar === '?') {
              const name = templatePart.name.slice(0, -1);
              return new BooleanAttributePart(instance, node, name, templatePart.strings);
          }
          return new PropertyPart(instance, node, templatePart.rawName, templatePart.strings);
      }
      return defaultPartCallback(instance, templatePart, node);
  };
  /**
   * Implements a boolean attribute, roughly as defined in the HTML
   * specification.
   *
   * If the value is truthy, then the attribute is present with a value of
   * ''. If the value is falsey, the attribute is removed.
   */
  class BooleanAttributePart extends AttributePart {
      setValue(values, startIndex) {
          const s = this.strings;
          if (s.length === 2 && s[0] === '' && s[1] === '') {
              const value = getValue(this, values[startIndex]);
              if (value === noChange) {
                  return;
              }
              if (value) {
                  this.element.setAttribute(this.name, '');
              }
              else {
                  this.element.removeAttribute(this.name);
              }
          }
          else {
              throw new Error('boolean attributes can only contain a single expression');
          }
      }
  }
  class PropertyPart extends AttributePart {
      setValue(values, startIndex) {
          const s = this.strings;
          let value;
          if (this._equalToPreviousValues(values, startIndex)) {
              return;
          }
          if (s.length === 2 && s[0] === '' && s[1] === '') {
              // An expression that occupies the whole attribute value will leave
              // leading and trailing empty strings.
              value = getValue(this, values[startIndex]);
          }
          else {
              // Interpolation, so interpolate
              value = this._interpolate(values, startIndex);
          }
          if (value !== noChange) {
              this.element[this.name] = value;
          }
          this._previousValues = values;
      }
  }
  class EventPart {
      constructor(instance, element, eventName) {
          this.instance = instance;
          this.element = element;
          this.eventName = eventName;
      }
      setValue(value) {
          const listener = getValue(this, value);
          if (listener === this._listener) {
              return;
          }
          if (listener == null) {
              this.element.removeEventListener(this.eventName, this);
          }
          else if (this._listener == null) {
              this.element.addEventListener(this.eventName, this);
          }
          this._listener = listener;
      }
      handleEvent(event) {
          if (typeof this._listener === 'function') {
              this._listener.call(this.element, event);
          }
          else if (typeof this._listener.handleEvent === 'function') {
              this._listener.handleEvent(event);
          }
      }
  }

  class LitElement extends PropertiesMixin(HTMLElement) {
      constructor() {
          super(...arguments);
          this.__renderComplete = null;
          this.__resolveRenderComplete = null;
          this.__isInvalid = false;
          this.__isChanging = false;
      }
      /**
       * Override which sets up element rendering by calling* `_createRoot`
       * and `_firstRendered`.
       */
      ready() {
          this._root = this._createRoot();
          super.ready();
          this._firstRendered();
      }
      connectedCallback() {
          if (window.ShadyCSS && this._root) {
              window.ShadyCSS.styleElement(this);
          }
          super.connectedCallback();
      }
      /**
       * Called after the element DOM is rendered for the first time.
       * Implement to perform tasks after first rendering like capturing a
       * reference to a static node which must be directly manipulated.
       * This should not be commonly needed. For tasks which should be performed
       * before first render, use the element constructor.
       */
      _firstRendered() { }
      /**
       * Implement to customize where the element's template is rendered by
       * returning an element into which to render. By default this creates
       * a shadowRoot for the element. To render into the element's childNodes,
       * return `this`.
       * @returns {Element|DocumentFragment} Returns a node into which to render.
       */
      _createRoot() {
          return this.attachShadow({ mode: 'open' });
      }
      /**
       * Override which returns the value of `_shouldRender` which users
       * should implement to control rendering. If this method returns false,
       * _propertiesChanged will not be called and no rendering will occur even
       * if property values change or `requestRender` is called.
       * @param _props Current element properties
       * @param _changedProps Changing element properties
       * @param _prevProps Previous element properties
       * @returns {boolean} Default implementation always returns true.
       */
      _shouldPropertiesChange(_props, _changedProps, _prevProps) {
          const shouldRender = this._shouldRender(_props, _changedProps, _prevProps);
          if (!shouldRender && this.__resolveRenderComplete) {
              this.__resolveRenderComplete(false);
          }
          return shouldRender;
      }
      /**
       * Implement to control if rendering should occur when property values
       * change or `requestRender` is called. By default, this method always
       * returns true, but this can be customized as an optimization to avoid
       * rendering work when changes occur which should not be rendered.
       * @param _props Current element properties
       * @param _changedProps Changing element properties
       * @param _prevProps Previous element properties
       * @returns {boolean} Default implementation always returns true.
       */
      _shouldRender(_props, _changedProps, _prevProps) {
          return true;
      }
      /**
       * Override which performs element rendering by calling
       * `_render`, `_applyRender`, and finally `_didRender`.
       * @param props Current element properties
       * @param changedProps Changing element properties
       * @param prevProps Previous element properties
       */
      _propertiesChanged(props, changedProps, prevProps) {
          super._propertiesChanged(props, changedProps, prevProps);
          const result = this._render(props);
          if (result && this._root !== undefined) {
              this._applyRender(result, this._root);
          }
          this._didRender(props, changedProps, prevProps);
          if (this.__resolveRenderComplete) {
              this.__resolveRenderComplete(true);
          }
      }
      _flushProperties() {
          this.__isChanging = true;
          this.__isInvalid = false;
          super._flushProperties();
          this.__isChanging = false;
      }
      /**
       * Override which warns when a user attempts to change a property during
       * the rendering lifecycle. This is an anti-pattern and should be avoided.
       * @param property {string}
       * @param value {any}
       * @param old {any}
       */
      // tslint:disable-next-line no-any
      _shouldPropertyChange(property, value, old) {
          const change = super._shouldPropertyChange(property, value, old);
          if (change && this.__isChanging) {
              console.trace(`Setting properties in response to other properties changing ` +
                  `considered harmful. Setting '${property}' from ` +
                  `'${this._getProperty(property)}' to '${value}'.`);
          }
          return change;
      }
      /**
       * Implement to describe the DOM which should be rendered in the element.
       * Ideally, the implementation is a pure function using only props to describe
       * the element template. The implementation must return a `lit-html`
       * TemplateResult. By default this template is rendered into the element's
       * shadowRoot. This can be customized by implementing `_createRoot`. This
       * method must be implemented.
       * @param {*} _props Current element properties
       * @returns {TemplateResult} Must return a lit-html TemplateResult.
       */
      _render(_props) {
          throw new Error('_render() not implemented');
      }
      /**
       * Renders the given lit-html template `result` into the given `node`.
       * Implement to customize the way rendering is applied. This is should not
       * typically be needed and is provided for advanced use cases.
       * @param result {TemplateResult} `lit-html` template result to render
       * @param node {Element|DocumentFragment} node into which to render
       */
      _applyRender(result, node) {
          render$1(result, node, this.localName);
      }
      /**
       * Called after element DOM has been rendered. Implement to
       * directly control rendered DOM. Typically this is not needed as `lit-html`
       * can be used in the `_render` method to set properties, attributes, and
       * event listeners. However, it is sometimes useful for calling methods on
       * rendered elements, like calling `focus()` on an element to focus it.
       * @param _props Current element properties
       * @param _changedProps Changing element properties
       * @param _prevProps Previous element properties
       */
      _didRender(_props, _changedProps, _prevProps) { }
      /**
       * Call to request the element to asynchronously re-render regardless
       * of whether or not any property changes are pending.
       */
      requestRender() { this._invalidateProperties(); }
      /**
       * Override which provides tracking of invalidated state.
       */
      _invalidateProperties() {
          this.__isInvalid = true;
          super._invalidateProperties();
      }
      /**
       * Returns a promise which resolves after the element next renders.
       * The promise resolves to `true` if the element rendered and `false` if the
       * element did not render.
       * This is useful when users (e.g. tests) need to react to the rendered state
       * of the element after a change is made.
       * This can also be useful in event handlers if it is desireable to wait
       * to send an event until after rendering. If possible implement the
       * `_didRender` method to directly respond to rendering within the
       * rendering lifecycle.
       */
      get renderComplete() {
          if (!this.__renderComplete) {
              this.__renderComplete = new Promise((resolve) => {
                  this.__resolveRenderComplete = (value) => {
                      this.__resolveRenderComplete = this.__renderComplete = null;
                      resolve(value);
                  };
              });
              if (!this.__isInvalid && this.__resolveRenderComplete) {
                  Promise.resolve().then(() => this.__resolveRenderComplete(false));
              }
          }
          return this.__renderComplete;
      }
  }

  class AtomSpinner extends LitElement {
    static get is() { return 'atom-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1;
      this.size = 60;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

        .atom-spinner {
          height: var(--atom-spinner-size, ${this.size}px);
          overflow: hidden;
          width: var(--atom-spinner-size, ${this.size}px);
        }

        .atom-spinner .spinner-inner {
          display: block;
          height: 100%;
          position: relative;
          width: 100%;
        }

        .atom-spinner .spinner-circle {
          color: var(--atom-spinner-color, ${this.color});
          display: block;
          font-size: calc(var(--atom-spinner-size, ${this.size}px) * 0.24);
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .atom-spinner .spinner-line {
          border-left: calc(var(--atom-spinner-size, ${this.size}px) / 25) solid var(--atom-spinner-color, ${this.color});
          border-radius: 50%;
          border-top: calc(var(--atom-spinner-size, ${this.size}px) / 25) solid transparent;
          height: 100%;
          position: absolute;
          width: 100%;
        }

        .atom-spinner .spinner-line:nth-child(1) {
          animation: atom-spinner-animation-1 var(--atom-spinner-duration, ${this.duration}s) linear infinite;
          transform: rotateZ(120deg) rotateX(66deg) rotateZ(0deg);
        }

        .atom-spinner .spinner-line:nth-child(2) {
          animation: atom-spinner-animation-2 var(--atom-spinner-duration, ${this.duration}s) linear infinite;
          transform: rotateZ(240deg) rotateX(66deg) rotateZ(0deg);
        }

        .atom-spinner .spinner-line:nth-child(3) {
          animation: atom-spinner-animation-3 var(--atom-spinner-duration, ${this.duration}s) linear infinite;
          transform: rotateZ(360deg) rotateX(66deg) rotateZ(0deg);
        }

        @keyframes atom-spinner-animation-1 {
          100% {
            transform: rotateZ(120deg) rotateX(66deg) rotateZ(360deg);
          }
        }

        @keyframes atom-spinner-animation-2 {
          100% {
            transform: rotateZ(240deg) rotateX(66deg) rotateZ(360deg);
          }
        }

        @keyframes atom-spinner-animation-3 {
          100% {
            transform: rotateZ(360deg) rotateX(66deg) rotateZ(360deg);
          }
        }
      </style>

      <div class="atom-spinner">
        <div class="spinner-inner">
          <div class="spinner-line"></div>
          <div class="spinner-line"></div>
          <div class="spinner-line"></div>

          <!--Chrome renders little circles malformed :(-->
          <div class="spinner-circle">&#9679;</div>
        </div>
      </div>
    `;
    }
  }

  customElements.define(AtomSpinner.is, AtomSpinner);

  class BreedingRhombusSpinner extends LitElement {
    static get is() { return 'breeding-rhombus-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 2;
      this.size = 65;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

        .breeding-rhombus-spinner {
          height: var(--breeding-rhombus-spinner-size, ${this.size}px);
          width: var(--breeding-rhombus-spinner-size, ${this.size}px);
          position: relative;
          transform: rotate(45deg);
        }

        .breeding-rhombus-spinner, .breeding-rhombus-spinner * {
          box-sizing: border-box;
        }

        .breeding-rhombus-spinner .rhombus {
          animation-duration: var(--breeding-rhombus-spinner-duration, ${this.duration}s);
          animation-iteration-count: infinite;
          background-color: var(--breeding-rhombus-spinner-color, ${this.color});
          height: calc(var(--breeding-rhombus-spinner-size, ${this.size}px) / 7.5);
          left: calc(var(--breeding-rhombus-spinner-size, ${this.size}px) / 2.3077);
          position: absolute;
          top: calc(var(--breeding-rhombus-spinner-size, ${this.size}px) / 2.3077);
          width: calc(var(--breeding-rhombus-spinner-size, ${this.size}px) / 7.5);
        }

        .breeding-rhombus-spinner .rhombus:nth-child(2n+0) {
          margin-right: 0;
        }

        .breeding-rhombus-spinner .rhombus.child-1 {
          animation-delay: calc(100ms * 1);
          animation-name: breeding-rhombus-spinner-animation-child-1;
        }

        .breeding-rhombus-spinner .rhombus.child-2 {
          animation-delay: calc(100ms * 2);
          animation-name: breeding-rhombus-spinner-animation-child-2;
        }

        .breeding-rhombus-spinner .rhombus.child-3 {
          animation-delay: calc(100ms * 3);
          animation-name: breeding-rhombus-spinner-animation-child-3;
        }

        .breeding-rhombus-spinner .rhombus.child-4 {
          animation-delay: calc(100ms * 4);
          animation-name: breeding-rhombus-spinner-animation-child-4;
        }

        .breeding-rhombus-spinner .rhombus.child-5 {
          animation-delay: calc(100ms * 5);
          animation-name: breeding-rhombus-spinner-animation-child-5;
        }

        .breeding-rhombus-spinner .rhombus.child-6 {
          animation-delay: calc(100ms * 6);
          animation-name: breeding-rhombus-spinner-animation-child-6;
        }

        .breeding-rhombus-spinner .rhombus.child-7 {
          animation-delay: calc(100ms * 7);
          animation-name: breeding-rhombus-spinner-animation-child-7;
        }

        .breeding-rhombus-spinner .rhombus.child-8 {
          animation-delay: calc(100ms * 8);
          animation-name: breeding-rhombus-spinner-animation-child-8;
        }

        .breeding-rhombus-spinner .rhombus.big {
          animation-delay: 0.5s;
          animation: breeding-rhombus-spinner-animation-child-big var(--breeding-rhombus-spinner-duration, ${this.duration}s) infinite;
          background-color: var(--breeding-rhombus-spinner-color, ${this.color});
          height: calc(var(--breeding-rhombus-spinner-size, ${this.size}px) / 3);
          left: calc(var(--breeding-rhombus-spinner-size, ${this.size}px) / 3);
          top: calc(var(--breeding-rhombus-spinner-size, ${this.size}px) / 3);
          width: calc(var(--breeding-rhombus-spinner-size, ${this.size}px) / 3);
        }

        @keyframes breeding-rhombus-spinner-animation-child-1 {
          50% {
            transform: translate(-325%, -325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-2 {
          50% {
            transform: translate(0, -325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-3 {
          50% {
            transform: translate(325%, -325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-4 {
          50% {
            transform: translate(325%, 0);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-5 {
          50% {
            transform: translate(325%, 325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-6 {
          50% {
            transform: translate(0, 325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-7 {
          50% {
            transform: translate(-325%, 325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-8 {
          50% {
            transform: translate(-325%, 0);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-big {
          50% {
            transform: scale(0.5);
          }
        }
      </style>

      <div class="breeding-rhombus-spinner">
        <div class="rhombus child-1"></div>
        <div class="rhombus child-2"></div>
        <div class="rhombus child-3"></div>
        <div class="rhombus child-4"></div>
        <div class="rhombus child-5"></div>
        <div class="rhombus child-6"></div>
        <div class="rhombus child-7"></div>
        <div class="rhombus child-8"></div>
        <div class="rhombus big"></div>
      </div>
    `;
    }
  }

  customElements.define(BreedingRhombusSpinner.is, BreedingRhombusSpinner);

  class CirclesToRhombusesSpinner extends LitElement {
    static get is() { return 'circles-to-rhombuses-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        numCircles: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1.2;
      this.numCircles = 3;
      this.size = 15;
    }

    _render() {
      const circleStyles = [];
      const circles = [];

      for (let i = 2; i <= this.numCircles; i++) {
        circleStyles.push(html$1`
        .circles-to-rhombuses-spinner .circle:nth-child(${i}) {
          animation-delay: calc(var(--circles-to-rhombuses-spinner-duration, ${this.duration}s) / 8 * ${i});
        }
      `);

        circles.push(html$1`<div class="circle"></div>`);
      }

      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

        .circles-to-rhombuses-spinner, .circles-to-rhombuses-spinner * {
          box-sizing: border-box;
        }

        .circles-to-rhombuses-spinner {
          align-items: center;
          display: flex;
          height: var(--circles-to-rhombuses-spinner-size, ${this.size}px);
          justify-content: center
          width: calc((var(--circles-to-rhombuses-spinner-size, ${this.size}px) + var(--circles-to-rhombuses-spinner-size, ${this.size}px) * 1.125) * ${this.numCircles});
        }

        .circles-to-rhombuses-spinner .circle {
          animation: circles-to-rhombuses-animation var(--circles-to-rhombuses-spinner-duration, ${this.duration}s) linear infinite;
          background: transparent;
          border-radius: 10%;
          border: 3px solid var(--circles-to-rhombuses-spinner-color, ${this.color});
          height: var(--circles-to-rhombuses-spinner-size, ${this.size}px);
          margin-left: calc(var(--circles-to-rhombuses-spinner-size, ${this.size}px) * 1.125);
          overflow: hidden;
          transform: rotate(45deg);
          width: var(--circles-to-rhombuses-spinner-size, ${this.size}px);
        }

        .circles-to-rhombuses-spinner .circle:nth-child(1) {
          animation-delay: calc(var(--circles-to-rhombuses-spinner-duration, ${this.duration}s) / 8 * 1);
          margin-left: 0;
        }

        ${circleStyles}

        @keyframes circles-to-rhombuses-animation {
          0% {
            border-radius: 10%;
          }
          17.5% {
            border-radius: 10%;
          }
          50% {
            border-radius: 100%;
          }
          93.5% {
            border-radius: 10%;
          }
          100% {
            border-radius: 10%;
          }
        }

        @keyframes circles-to-rhombuses-background-animation {
          50% {
            opacity: 0.4;
          }
        }
      </style>

      <div class="circles-to-rhombuses-spinner">
        <div class="circle"></div>
        ${circles}
      </div>
    `;
    }
  }

  customElements.define(CirclesToRhombusesSpinner.is, CirclesToRhombusesSpinner);

  class FingerprintSpinner extends LitElement {
    static get is() { return 'fingerprint-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1.5;
      this.size = 64;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

        .fingerprint-spinner {
          height: var(--fingerprint-spinner-size, ${this.size}px);
          overflow: hidden;
          padding: 2px;
          position: relative;
          width: var(--fingerprint-spinner-size, ${this.size}px);
        }

        .fingerprint-spinner .spinner-ring {
          animation: fingerprint-spinner-animation var(--fingerprint-spinner-duration, ${this.duration}s) cubic-bezier(0.680, -0.750, 0.265, 1.750) infinite forwards;
          border-bottom-color: transparent;
          border-left-color: transparent;
          border-radius: 50%;
          border-right-color: transparent;
          border-style: solid;
          border-top-color: var(--fingerprint-spinner-color, ${this.color});
          border-width: 2px;
          bottom: 0;
          left: 0;
          margin: auto;
          position: absolute;
          right: 0;
          top: 0;
        }

        .fingerprint-spinner .spinner-ring:nth-child(1) {
          animation-delay: calc(50ms * 1);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 0 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 0 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(2) {
          animation-delay: calc(50ms * 2);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 1 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 1 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(3) {
          animation-delay: calc(50ms * 3);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 2 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 2 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(4) {
          animation-delay: calc(50ms * 4);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 3 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 3 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(5) {
          animation-delay: calc(50ms * 5);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 4 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 4 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(6) {
          animation-delay: calc(50ms * 6);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 5 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 5 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(7) {
          animation-delay: calc(50ms * 7);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 6 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 6 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(8) {
          animation-delay: calc(50ms * 8);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 7 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 7 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(9) {
          animation-delay: calc(50ms * 9);
          height: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 8 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
          width: calc(var(--fingerprint-spinner-size, ${this.size}px) / 9 + 8 * var(--fingerprint-spinner-size, ${this.size}px) / 9);
        }

        @keyframes fingerprint-spinner-animation {
          100% {
            transform: rotate( 360deg );
          }
        }
      </style>

      <div class="fingerprint-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
    `;
    }
  }

  customElements.define(FingerprintSpinner.is, FingerprintSpinner);

  class FlowerSpinner extends LitElement {
    static get is() { return 'flower-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.duration = 2.5;
      this.color = '#ff1d5e';
      this.size = 70;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

        .flower-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: var(--flower-spinner-size, ${this.size}px);
          justify-content: center;
          width: var(--flower-spinner-size, ${this.size}px);
        }

        .flower-spinner .dots-container {
          height: calc(var(--flower-spinner-size, ${this.size}px) / 7);
          width: calc(var(--flower-spinner-size, ${this.size}px) / 7);
        }

        .flower-spinner .smaller-dot {
          animation: flower-spinner-smaller-dot-animation var(--flower-spinner-duration, ${this.duration}s) 0s infinite both;
          background: var(--fingerprint-spinner-color, ${this.color});
          border-radius: 50%;
          height: 100%;
          width: 100%;
        }

        .flower-spinner .bigger-dot {
          animation: flower-spinner-bigger-dot-animation var(--flower-spinner-duration, ${this.duration}s) 0s infinite both;
          background: var(--fingerprint-spinner-color, ${this.color});
          border-radius: 50%;
          height: 100%;
          padding: 10%;
          width: 100%;
        }

        @keyframes flower-spinner-bigger-dot-animation {
          0%, 100% {
            box-shadow: var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px;
          }
          50% {
            transform: rotate(180deg);
          }
          25%, 75% {
            box-shadow: var(--fingerprint-spinner-color, ${this.color}) 26px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) -26px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 26px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px -26px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 19px -19px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 19px 19px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) -19px -19px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) -19px 19px 0px;
          }
          100% {
            transform: rotate(360deg);
            box-shadow: var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px;
          }
        }
        @keyframes flower-spinner-smaller-dot-animation {
          0%, 100% {
            box-shadow: var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
            var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
            var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
            var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
            var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
            var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
            var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
            var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px;
          }
          25%, 75% {
            box-shadow: var(--fingerprint-spinner-color, ${this.color}) 14px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) -14px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 14px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px -14px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 10px -10px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 10px 10px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) -10px -10px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) -10px 10px 0px;
          }
          100% {
            box-shadow: var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px,
                        var(--fingerprint-spinner-color, ${this.color}) 0px 0px 0px;
          }
        }
      </style>

      <div class="flower-spinner">
        <div class="dots-container">
          <div class="bigger-dot">
            <div class="smaller-dot"></div>
          </div>
        </div>
      </div>
    `;
    }
  }

  customElements.define(FlowerSpinner.is, FlowerSpinner);

  class FulfillingBouncingCircleSpinner extends LitElement {
    static get is() { return 'fulfilling-bouncing-circle-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 4;
      this.size = 50;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

        .fulfilling-bouncing-circle-spinner {
          animation: fulfilling-bouncing-circle-spinner-animation infinite var(--fulfilling-bouncing-circle-spinner-duration, ${this.duration}s) ease;
          height: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
          position: relative;
          width: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
        }

        .fulfilling-bouncing-circle-spinner .orbit {
          animation: fulfilling-bouncing-circle-spinner-orbit-animation infinite var(--fulfilling-bouncing-circle-spinner-duration, ${this.duration}s) ease;
          border-radius: 50%;
          border: calc(var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px) * 0.03) solid var(--fulfilling-bouncing-circle-spinner-color, ${this.color});
          height: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
          left: 0;
          position: absolute;
          top: 0;
          width: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
        }

        .fulfilling-bouncing-circle-spinner .circle {
          animation: fulfilling-bouncing-circle-spinner-circle-animation infinite var(--fulfilling-bouncing-circle-spinner-duration, ${this.duration}s) ease;
          border-radius: 50%;
          border: calc(var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px) * 0.1) solid var(--fulfilling-bouncing-circle-spinner-color, ${this.color});
          color: var(--fulfilling-bouncing-circle-spinner-color, ${this.color});
          display: block;
          height: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
          position: relative;
          transform: rotate(0deg) scale(1);
          width: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
        }

        @keyframes fulfilling-bouncing-circle-spinner-animation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fulfilling-bouncing-circle-spinner-orbit-animation {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1);
          }
          62.5% {
            transform: scale(0.8);
          }
          75% {
            transform: scale(1);
          }
          87.5% {
            transform: scale(0.8);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes fulfilling-bouncing-circle-spinner-circle-animation {
          0% {
            border-bottom-color: transparent;
            border-left-color: transparent;
            border-right-color: transparent;
            border-top-color: inherit;
            transform: scale(1);
          }

          16.7% {
            border-bottom-color: transparent;
            border-left-color: transparent;
            border-right-color: initial;
            border-top-color: initial;
          }

          33.4% {
            border-bottom-color: inherit;
            border-left-color: transparent;
            border-right-color: inherit;
            border-top-color: inherit;
          }

          50% {
            border-color: inherit;
            transform: scale(1);
          }

          62.5% {
            border-color: inherit;
            transform: scale(1.4);
          }

          75% {
            border-color: inherit;
            opacity: 1;
            transform: scale(1);
          }

          87.5% {
            border-color: inherit;
            transform: scale(1.4);
          }

          100% {
            border-color: transparent;
            border-top-color: inherit;
            transform: scale(1);
          }
        }
      </style>

      <div class="fulfilling-bouncing-circle-spinner">
        <div class="circle"></div>
        <div class="orbit"></div>
      </div>
    `;
    }
  }

  customElements.define(FulfillingBouncingCircleSpinner.is, FulfillingBouncingCircleSpinner);

  class FulfillingSquareSpinner extends LitElement {
    static get is() { return 'fulfilling-square-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 4;
      this.size = 50;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

        .fulfilling-square-spinner {
          height: var(--fulfilling-square-spinner-size, ${this.size}px);
          width: var(--fulfilling-square-spinner-size, ${this.size}px);
          position: relative;
          border: 4px solid var(--fulfilling-square-spinner-color, ${this.color});
          animation: fulfilling-square-spinner-animation var(--fulfilling-square-spinner-duration, ${this.duration}s) infinite ease;
        }

        .fulfilling-square-spinner .spinner-inner {
          vertical-align: top;
          display: inline-block;
          background-color: var(--fulfilling-square-spinner-color, ${this.color});
          width: 100%;
          opacity: 1;
          animation: fulfilling-square-spinner-inner-animation var(--fulfilling-square-spinner-duration, ${this.duration}s) infinite ease-in;
        }

        @keyframes fulfilling-square-spinner-animation {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(180deg); }
          50%  { transform: rotate(180deg); }
          75%  { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fulfilling-square-spinner-inner-animation {
          0%   { height: 0%; }
          25%  { height: 0%; }
          50%  { height: 100%; }
          75%  { height: 100%; }
          100% { height: 0%; }
        }
      </style>

      <div class="fulfilling-square-spinner">
        <div class="spinner-inner"></div>
      </div>
    `;
    }
  }

  customElements.define(FulfillingSquareSpinner.is, FulfillingSquareSpinner);

  class HalfCircleSpinner extends LitElement {
    static get is() { return 'half-circle-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.duration = 1;
      this.color = '#ff1d5e';
      this.size = 60;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .half-circle-spinner {
          border-radius: 100%;
          height: var(--half-circle-spinner-size, ${this.size}px);
          position: relative;
          width: var(--half-circle-spinner-size, ${this.size}px);
        }

        .half-circle-spinner .circle {
          border-radius: 100%;
          border: calc(var(--half-circle-spinner-size, ${this.size}px) / 10) solid transparent;
          content: "";
          height: 100%;
          position: absolute;
          width: 100%;
        }

        .half-circle-spinner .circle.circle-1 {
          animation: half-circle-spinner-animation var(--half-circle-spinner-duration, ${this.duration}s) infinite;
          border-top-color: var(--half-circle-spinner-color, ${this.color});
        }

        .half-circle-spinner .circle.circle-2 {
          animation: half-circle-spinner-animation var(--half-circle-spinner-duration, ${this.duration}s) infinite alternate;
          border-bottom-color: var(--half-circle-spinner-color, ${this.color});
        }

        @keyframes half-circle-spinner-animation {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>

      <div class="half-circle-spinner">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
      </div>
    `;
    }
  }

  customElements.define(HalfCircleSpinner.is, HalfCircleSpinner);

  class HollowDotsSpinner extends LitElement {
    static get is() { return 'hollow-dots-spinner'; }

    static get properties() {
      return {
        duration: Number,
        color: String,
        numDots: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1;
      this.numDots = 3;
      this.size = 15;
    }

    _render() {
      const dotStyles = [];
      const dots = [];

      for (let i = 1; i <= this.numDots; i++) {
        dotStyles.push(html$1`
        .hollow-dots-spinner .dot:nth-child(${i}) {
          animation-delay: calc(var(--hollow-dots-spinner-duration, ${this.duration}s) / ${this.numDots} * ${i});
        }
      `);

        dots.push(html$1`<div class="dot"></div>`);
      }

      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .hollow-dots-spinner {
          height: var(--hollow-dots-spinner-size, ${this.size}px);
          width: calc(var(--hollow-dots-spinner-size, ${this.size}px) * 2 * ${this.numDots});
        }

        .hollow-dots-spinner .dot {
          animation: hollow-dots-spinner-animation var(--hollow-dots-spinner-duration, ${this.duration}s) ease infinite 0ms;
          border-radius: 50%;
          border: calc(var(--hollow-dots-spinner-size, ${this.size}px) / 5) solid var(--hollow-dots-spinner-color, ${this.color});
          float: left;
          height: var(--hollow-dots-spinner-size, ${this.size}px);
          margin: 0 calc(var(--hollow-dots-spinner-size, ${this.size}px) / 2);
          transform: scale(0);
          width: var(--hollow-dots-spinner-size, ${this.size}px);
        }

        ${dotStyles}

        @keyframes hollow-dots-spinner-animation {
          50% {
            transform: scale(1);
            opacity: 1;
          }

          100% {
            opacity: 0;
          }
        }
      </style>

      <div class="hollow-dots-spinner">
        ${dots}
      </div>
    `;
    }
  }

  customElements.define(HollowDotsSpinner.is, HollowDotsSpinner);

  class IntersectingCirclesSpinner extends LitElement {
    static get is() { return 'intersecting-circles-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1.2;
      this.size = 35;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .intersecting-circles-spinner {
          height: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 2);
          width: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 2);
          position: relative;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }

        .intersecting-circles-spinner .spinnerBlock {
          animation: intersecting-circles-spinners-animation var(--intersecting-circles-spinner-duration, ${this.duration}s) linear infinite;
          transform-origin: center;
          display: block;
          height: var(--intersecting-circles-spinner-size, ${this.size}px);
          width: var(--intersecting-circles-spinner-size, ${this.size}px);
        }

        .intersecting-circles-spinner .circle {
          display: block;
          border: 2px solid var(--intersecting-circles-spinner-color, ${this.color});
          border-radius: 50%;
          height: 100%;
          width: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }

        .intersecting-circles-spinner .circle:nth-child(1) {
          left: 0;
          top: 0;
        }

        .intersecting-circles-spinner .circle:nth-child(2) {
          left: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.36);
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.2);
        }

        .intersecting-circles-spinner .circle:nth-child(3) {
          left: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.36);
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.2);
        }

        .intersecting-circles-spinner .circle:nth-child(4) {
          left: 0;
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.36);
        }

        .intersecting-circles-spinner .circle:nth-child(5) {
          left: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.36);
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.2);
        }

        .intersecting-circles-spinner .circle:nth-child(6) {
          left: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.36);
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.2);
        }

        .intersecting-circles-spinner .circle:nth-child(7) {
          left: 0;
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.36);
        }

        @keyframes intersecting-circles-spinners-animation {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      </style>

      <div class="intersecting-circles-spinner">
        <div class="spinnerBlock">
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
        </div>
      </div>
    `;
    }
  }

  customElements.define(IntersectingCirclesSpinner.is, IntersectingCirclesSpinner);

  class LoopingRhombusesSpinner extends LitElement {
    static get is() { return 'looping-rhombuses-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 2.5;
      this.size = 15;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .looping-rhombuses-spinner {
          height: var(--looping-rhombuses-spinner-size, ${this.size}px);
          position: relative;
          width: calc(var(--looping-rhombuses-spinner-size, ${this.size}px) * 4);
        }

        .looping-rhombuses-spinner .rhombus {
          animation: looping-rhombuses-spinner-animation var(--looping-rhombuses-spinner-duration, ${this.duration}s) linear infinite;
          background-color: var(--looping-rhombuses-spinner-color, ${this.color});
          border-radius: 2px;
          height: var(--looping-rhombuses-spinner-size, ${this.size}px);
          left: calc(var(--looping-rhombuses-spinner-size, ${this.size}px) * 4);
          margin: 0 auto;
          position: absolute;
          transform: translateY(0) rotate(45deg) scale(0);
          width: var(--looping-rhombuses-spinner-size, ${this.size}px);
        }

        .looping-rhombuses-spinner .rhombus:nth-child(1) {
          animation-delay: calc(var(--looping-rhombuses-spinner-duration, ${this.duration}s) * 1 / -1.5);
        }

        .looping-rhombuses-spinner .rhombus:nth-child(2) {
          animation-delay: calc(var(--looping-rhombuses-spinner-duration, ${this.duration}s) * 2 / -1.5);
        }

        .looping-rhombuses-spinner .rhombus:nth-child(3) {
          animation-delay: calc(var(--looping-rhombuses-spinner-duration, ${this.duration}s) * 3 / -1.5);
        }

        @keyframes looping-rhombuses-spinner-animation {
          0%   { transform: translateX(0)     rotate(45deg) scale(0); }
          50%  { transform: translateX(-233%) rotate(45deg) scale(1); }
          100% { transform: translateX(-466%) rotate(45deg) scale(0); }
        }
      </style>

      <div class="looping-rhombuses-spinner">
        <div class="rhombus"></div>
        <div class="rhombus"></div>
        <div class="rhombus"></div>
      </div>
    `;
    }
  }

  customElements.define(LoopingRhombusesSpinner.is, LoopingRhombusesSpinner);

  class OrbitSpinner extends LitElement {
    static get is() { return 'orbit-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1.2;
      this.size = 55;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .orbit-spinner {
          border-radius: 50%;
          height: var(--orbit-spinner-size, ${this.size}px);
          perspective: 800px;
          width: var(--orbit-spinner-size, ${this.size}px);
        }

        .orbit-spinner .orbit {
          border-radius: 50%;
          box-sizing: border-box;
          height: 100%;
          position: absolute;
          width: 100%;
        }

        .orbit-spinner .orbit:nth-child(1) {
          animation: orbit-spinner-orbit-one-animation var(--orbit-spinner-duration, ${this.duration}s) linear infinite;
          border-bottom: 3px solid var(--orbit-spinner-color, ${this.color});
          left: 0%;
          top: 0%;
        }

        .orbit-spinner .orbit:nth-child(2) {
          animation: orbit-spinner-orbit-two-animation var(--orbit-spinner-duration, ${this.duration}s) linear infinite;
          border-right: 3px solid var(--orbit-spinner-color, ${this.color});
          right: 0%;
          top: 0%;
        }

        .orbit-spinner .orbit:nth-child(3) {
          animation: orbit-spinner-orbit-three-animation var(--orbit-spinner-duration, ${this.duration}s) linear infinite;
          border-top: 3px solid var(--orbit-spinner-color, ${this.color});
          bottom: 0%;
          right: 0%;
        }

        @keyframes orbit-spinner-orbit-one-animation {
          0%   { transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg); }
          100% { transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg); }
        }

        @keyframes orbit-spinner-orbit-two-animation {
          0%   { transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg); }
          100% { transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg); }
        }

        @keyframes orbit-spinner-orbit-three-animation {
          0%   { transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg); }
          100% { transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
          }
        }
      </style>

      <div class="orbit-spinner">
        <div class="orbit"></div>
        <div class="orbit"></div>
        <div class="orbit"></div>
      </div>
    `;
    }
  }

  customElements.define(OrbitSpinner.is, OrbitSpinner);

  class PixelSpinner extends LitElement {
    static get is() { return 'pixel-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 2;
      this.size = 70;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .pixel-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: var(--pixel-spinner-size, ${this.size}px);
          justify-content: center;
          width: var(--pixel-spinner-size, ${this.size}px);
        }

        .pixel-spinner .pixel-spinner-inner {
          animation: pixel-spinner-animation var(--pixel-spinner-duration, ${this.duration}s) linear infinite;
          background-color: var(--pixel-spinner-color, ${this.color});
          box-shadow: 15px 15px  0 0,
                      -15px -15px  0 0,
                      15px -15px  0 0,
                      -15px 15px  0 0,
                      0 15px  0 0,
                      15px 0  0 0,
                      -15px 0  0 0,
                      0 -15px 0 0;
          color: var(--pixel-spinner-color, ${this.color});
          height: calc(var(--pixel-spinner-size, ${this.size}px) / 7);
          width: calc(var(--pixel-spinner-size, ${this.size}px) / 7);
        }

        @keyframes pixel-spinner-animation {
          50% {
            box-shadow: 20px 20px 0px 0px,
                        -20px -20px 0px 0px,
                        20px -20px 0px 0px,
                        -20px 20px 0px 0px,
                        0px 10px 0px 0px,
                        10px 0px 0px 0px,
                        -10px 0px 0px 0px,
                        0px -10px 0px 0px;
          }

          75% {
            box-shadow: 20px 20px 0px 0px,
                        -20px -20px 0px 0px,
                        20px -20px 0px 0px,
                        -20px 20px 0px 0px,
                        0px 10px 0px 0px,
                        10px 0px 0px 0px,
                        -10px 0px 0px 0px,
                        0px -10px 0px 0px;
          }

          100% {
            transform: rotate(360deg);
          }
        }
      </style>

      <div class="pixel-spinner">
        <div class="pixel-spinner-inner"></div>
      </div>
    `;
    }
  }

  customElements.define(PixelSpinner.is, PixelSpinner);

  class RadarSpinner extends LitElement {
    static get is() { return 'radar-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 2;
      this.size = 60;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .radar-spinner {
          height: var(--radar-spinner-size, ${this.size}px);
          position: relative;
          width: var(--radar-spinner-size, ${this.size}px);
        }

        .radar-spinner .circle {
          animation: radar-spinner-animation var(--radar-spinner-duration, ${this.duration}s) infinite;
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }

        .radar-spinner .circle:nth-child(1) {
          animation-delay: calc(var(--radar-spinner-duration, ${this.duration}s) / 6.67);
          padding: calc(var(--radar-spinner-size, ${this.size}px) * 5 * 2 * 0 / 110);
        }

        .radar-spinner .circle:nth-child(2) {
          animation-delay: calc(var(--radar-spinner-duration, ${this.duration}s) / 6.67);
          padding: calc(var(--radar-spinner-size, ${this.size}px) * 5 * 2 * 1 / 110);
        }

        .radar-spinner .circle:nth-child(3) {
          animation-delay: calc(var(--radar-spinner-duration, ${this.duration}s) / 6.67);
          padding: calc(var(--radar-spinner-size, ${this.size}px) * 5 * 2 * 2 / 110);
        }

        .radar-spinner .circle:nth-child(4) {
          animation-delay: 0ms;
          padding: calc(var(--radar-spinner-size, ${this.size}px) * 5 * 2 * 3 / 110);
        }

        .radar-spinner .circle-inner, .radar-spinner .circle-inner-container {
          border-radius: 50%;
          border: calc(var(--radar-spinner-size, ${this.size}px) * 5 / 110) solid transparent;
          height: 100%;
          width: 100%;
        }

        .radar-spinner .circle-inner {
          border-left-color: var(--radar-spinner-color, ${this.color});
          border-right-color: var(--radar-spinner-color, ${this.color});
        }

        @keyframes radar-spinner-animation {
          50%  { transform: rotate(180deg); }
          100% { transform: rotate(0deg); }
        }
      </style>

      <div class="radar-spinner">
        <div class="circle">
          <div class="circle-inner-container">
            <div class="circle-inner"></div>
          </div>
        </div>

        <div class="circle">
          <div class="circle-inner-container">
            <div class="circle-inner"></div>
          </div>
        </div>

        <div class="circle">
          <div class="circle-inner-container">
            <div class="circle-inner"></div>
          </div>
        </div>

        <div class="circle">
          <div class="circle-inner-container">
            <div class="circle-inner"></div>
          </div>
        </div>
      </div>
    `;
    }
  }

  customElements.define(RadarSpinner.is, RadarSpinner);

  class ScalingSquaresSpinner extends LitElement {
    static get is() { return 'scaling-squares-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1.25;
      this.size = 65;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .scaling-squares-spinner {
          align-items: center;
          animation: scaling-squares-animation var(--scaling-squares-spinner-duration, ${this.duration}s) infinite;
          display: flex;
          flex-direction: row;
          height: var(--scaling-squares-spinner-size, ${this.size}px);
          justify-content: center;
          position: relative;
          transform: rotate(0deg);
          width: var(--scaling-squares-spinner-size, ${this.size}px);
        }

        .scaling-squares-spinner .square {
          animation-duration: var(--scaling-squares-spinner-duration, ${this.duration}s);
          animation-iteration-count: infinite;
          border: calc(var(--scaling-squares-spinner-size, ${this.size}px) * 0.04 / 1.3) solid var(--scaling-squares-spinner-color, ${this.color});
          height: calc(var(--scaling-squares-spinner-size, ${this.size}px) * 0.25 / 1.3);
          margin-left: auto;
          margin-right: auto;
          position: absolute;
          width: calc(var(--scaling-squares-spinner-size, ${this.size}px) * 0.25 / 1.3);
        }

        .scaling-squares-spinner .square:nth-child(1) {
          animation-name: scaling-squares-spinner-animation-child-1;
        }

        .scaling-squares-spinner .square:nth-child(2) {
          animation-name: scaling-squares-spinner-animation-child-2;
        }

        .scaling-squares-spinner .square:nth-child(3) {
          animation-name: scaling-squares-spinner-animation-child-3;
        }

        .scaling-squares-spinner .square:nth-child(4) {
          animation-name: scaling-squares-spinner-animation-child-4;
        }

        @keyframes scaling-squares-animation {
          50%  { transform: rotate(90deg); }
          100% { transform: rotate(180deg); }
        }

        @keyframes scaling-squares-spinner-animation-child-1 {
          50% { transform: translate(150%,150%) scale(2,2); }
        }

        @keyframes scaling-squares-spinner-animation-child-2 {
          50% { transform: translate(-150%,150%) scale(2,2); }
        }

        @keyframes scaling-squares-spinner-animation-child-3 {
          50% { transform: translate(-150%,-150%) scale(2,2); }
        }

        @keyframes scaling-squares-spinner-animation-child-4 {
          50% { transform: translate(150%,-150%) scale(2,2); }
        }
      </style>

      <div class="scaling-squares-spinner">
        <div class="square"></div>
        <div class="square"></div>
        <div class="square"></div>
        <div class="square"></div>
      </div>
    `;
    }
  }

  customElements.define(ScalingSquaresSpinner.is, ScalingSquaresSpinner);

  class SelfBuildingSquareSpinner extends LitElement {
    static get is() { return 'self-building-square-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 6;
      this.size = 10;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .self-building-square-spinner {
          height: calc(var(--self-building-square-spinner-size, ${this.size}px) * 4);
          top: calc(var(--self-building-square-spinner-size, ${this.size}px) * 2 / 3);
          width: calc(var(--self-building-square-spinner-size, ${this.size}px) * 4);
        }
        .self-building-square-spinner .square {
          animation: self-building-square-spinner var(--self-building-square-spinner-duration, ${this.duration}s) infinite;
          background: var(--self-building-square-spinner-color, ${this.color});
          float: left;
          height: var(--self-building-square-spinner-size, ${this.size}px);
          margin-right: calc(var(--self-building-square-spinner-size, ${this.size}px) / 3);
          margin-top: calc(var(--self-building-square-spinner-size, ${this.size}px) / 3);
          opacity: 0;
          position:relative;
          top: calc(var(--self-building-square-spinner-size, ${this.size}px) * -2 / 3);
          width: var(--self-building-square-spinner-size, ${this.size}px);
        }

        .self-building-square-spinner .square:nth-child(1) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 6);
        }

        .self-building-square-spinner .square:nth-child(2) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 7);
        }

        .self-building-square-spinner .square:nth-child(3) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 8);
        }

        .self-building-square-spinner .square:nth-child(4) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 3);
        }

        .self-building-square-spinner .square:nth-child(5) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 4);
        }

        .self-building-square-spinner .square:nth-child(6) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 5);
        }

        .self-building-square-spinner .square:nth-child(7) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 0);
        }

        .self-building-square-spinner .square:nth-child(8) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 1);
        }

        .self-building-square-spinner .square:nth-child(9) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 2);
        }

        .self-building-square-spinner .clear {
          clear: both;
        }

        @keyframes self-building-square-spinner {
          0% {
            opacity: 0;
          }

          5% {
            opacity: 1;
            top: 0;
          }

          50.9% {
            opacity: 1;
            top: 0;
          }

          55.9% {
            opacity: 0;
            top: inherit;
          }
        }
      </style>

      <div class="self-building-square-spinner">
        <div class="square"></div>
        <div class="square"></div>
        <div class="square"></div>
        <div class="square clear"></div>
        <div class="square"></div>
        <div class="square"></div>
        <div class="square clear"></div>
        <div class="square"></div>
        <div class="square"></div>
      </div>
    `;
    }
  }

  customElements.define(SelfBuildingSquareSpinner.is, SelfBuildingSquareSpinner);

  class SemipolarSpinner extends LitElement {
    static get is() { return 'semipolar-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 2;
      this.size = 65;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .semipolar-spinner {
          height: var(--semipolar-spinner-size, ${this.size}px);
          position: relative;
          width: var(--semipolar-spinner-size, ${this.size}px);
        }

        .semipolar-spinner .ring {
          animation: semipolar-spinner-animation var(--semipolar-spinner-duration, ${this.duration}s) infinite;
          border-bottom-color: transparent;
          border-left-color: var(--semipolar-spinner-color, ${this.color});
          border-radius: 50%;
          border-right-color: transparent;
          border-style: solid;
          border-top-color: var(--semipolar-spinner-color, ${this.color});
          border-width: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.05);
          position: absolute;
        }

        .semipolar-spinner .ring:nth-child(1) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 4);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 0);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 0);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 0);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 0);
          z-index: 5;
        }

        .semipolar-spinner .ring:nth-child(2) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 3);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 1);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 1);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 1);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 1);
          z-index: 4;
        }

        .semipolar-spinner .ring:nth-child(3) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 2);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 2);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 2);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 2);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 2);
          z-index: 3;
        }

        .semipolar-spinner .ring:nth-child(4) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 1);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 3);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 3);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 3);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 3);
          z-index: 2;
        }

        .semipolar-spinner .ring:nth-child(5) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 0);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 4);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 4);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 4);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 4);
          z-index: 1;
        }

        @keyframes semipolar-spinner-animation {
          50% { transform: rotate(360deg) scale(0.7); }
        }
      </style>

      <div class="semipolar-spinner" :style="spinnerStyle">
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="ring"></div>
      </div>
    `;
    }
  }

  customElements.define(SemipolarSpinner.is, SemipolarSpinner);

  class SpringSpinner extends LitElement {
    static get is() { return 'spring-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 3;
      this.size = 60;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .spring-spinner {
          height: var(--spring-spinner-size, ${this.size}px);
          width: var(--spring-spinner-size, ${this.size}px);
        }

        .spring-spinner .spring-spinner-part {
          height: calc(var(--spring-spinner-size, ${this.size}px) / 2);
          overflow: hidden;
          width: var(--spring-spinner-size, ${this.size}px);
        }

        .spring-spinner  .spring-spinner-part.bottom {
           transform: rotate(180deg) scale(-1, 1);
        }

        .spring-spinner .spring-spinner-rotator {
          animation: spring-spinner-animation var(--spring-spinner-duration, ${this.duration}s) ease-in-out infinite;
          border-bottom-color: transparent;
          border-left-color: transparent;
          border-radius: 50%;
          border-right-color: var(--spring-spinner-color, ${this.color});
          border-style: solid;
          border-top-color: var(--spring-spinner-color, ${this.color});
          border-width: calc(var(--spring-spinner-size, ${this.size}px) / 7);
          height: var(--spring-spinner-size, ${this.size}px);
          transform: rotate(-200deg);
          width: var(--spring-spinner-size, ${this.size}px);
        }

        @keyframes spring-spinner-animation {
          0% {
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 7);
          }

          25% {
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 23.33);
          }

          50% {
            transform: rotate(115deg);
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 7);
          }

          75% {
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 23.33);
          }

          100% {
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 7);
          }
        }
      </style>

      <div class="spring-spinner">
        <div class="spring-spinner-part top">
          <div class="spring-spinner-rotator"></div>
        </div>

        <div class="spring-spinner-part bottom">
          <div class="spring-spinner-rotator"></div>
        </div>
      </div>
    `;
    }
  }

  customElements.define(SpringSpinner.is, SpringSpinner);

  class SwappingSquaresSpinner extends LitElement {
    static get is() { return 'swapping-squares-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1;
      this.size = 65;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .swapping-squares-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: var(--swapping-squares-spinner-size, ${this.size}px);
          justify-content: center;
          position: relative;
          width: var(--swapping-squares-spinner-size, ${this.size}px);
        }

        .swapping-squares-spinner .square {
          animation-duration: var(--swapping-squares-spinner-duration, ${this.duration}s);
          animation-iteration-count: infinite;
          border: calc(var(--swapping-squares-spinner-size, ${this.size}px) * 0.04 / 1.3) solid var(--swapping-squares-spinner-color, ${this.color});
          height: calc(var(--swapping-squares-spinner-size, ${this.size}px) * 0.25 / 1.3);
          margin-left: auto;
          margin-right: auto;
          position: absolute;
          width: calc(var(--swapping-squares-spinner-size, ${this.size}px) * 0.25 / 1.3);
        }

        .swapping-squares-spinner .square:nth-child(1) {
          animation-delay: calc(var(--swapping-squares-spinner-duration, ${this.duration}s) / 2);
          animation-name: swapping-squares-animation-child-1;
        }

        .swapping-squares-spinner .square:nth-child(2) {
          animation-delay: 0ms;
          animation-name: swapping-squares-animation-child-2;
        }

        .swapping-squares-spinner .square:nth-child(3) {
          animation-delay: calc(var(--swapping-squares-spinner-duration, ${this.duration}s) / 2);
          animation-name: swapping-squares-animation-child-3;
        }

        .swapping-squares-spinner .square:nth-child(4) {
          animation-delay: 0ms;
          animation-name: swapping-squares-animation-child-4;
        }

        @keyframes swapping-squares-animation-child-1 {
          50% { transform: translate(150%,150%) scale(2,2); }
        }

        @keyframes swapping-squares-animation-child-2 {
          50% { transform: translate(-150%,150%) scale(2,2); }
        }

        @keyframes swapping-squares-animation-child-3 {
          50% { transform: translate(-150%,-150%) scale(2,2); }
        }

        @keyframes swapping-squares-animation-child-4 {
          50% { transform: translate(150%,-150%) scale(2,2); }
        }
      </style>

      <div class="swapping-squares-spinner" :style="spinnerStyle">
        <div class="square"></div>
        <div class="square"></div>
        <div class="square"></div>
        <div class="square"></div>
      </div>
    `;
    }
  }

  customElements.define(SwappingSquaresSpinner.is, SwappingSquaresSpinner);

  class TrinityRingsSpinner extends LitElement {
    static get is() { return 'trinity-rings-spinner'; }

    static get properties() {
      return {
        color: String,
        duration: Number,
        size: Number,
      };
    }

    constructor() {
      super();

      this.color = '#ff1d5e';
      this.duration = 1.5;
      this.size = 60;
    }

    _render() {
      return html$1`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .trinity-rings-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 2);
          justify-content: center;
          overflow: hidden;
          padding: 3px;
          position: relative;
          width: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 2);
        }

        .trinity-rings-spinner .circle {
          border-radius: 50%;
          border: 3px solid var(--trinity-rings-spinner-color, ${this.color});
          display: block;
          opacity: 1;
          position: absolute;
        }

        .trinity-rings-spinner .circle:nth-child(1) {
          animation: trinity-rings-spinner-circle1-animation var(--trinity-rings-spinner-duration, ${this.duration}s) infinite linear;
          border-width: 3px;
          height: var(--trinity-rings-spinner-size, ${this.size}px);
          width: var(--trinity-rings-spinner-size, ${this.size}px);
        }

        .trinity-rings-spinner .circle:nth-child(2) {
          animation: trinity-rings-spinner-circle2-animation var(--trinity-rings-spinner-duration, ${this.duration}s) infinite linear;
          border-width: 2px;
          height: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 0.65);
          width: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 0.65);
        }

        .trinity-rings-spinner .circle:nth-child(3) {
          animation:trinity-rings-spinner-circle3-animation var(--trinity-rings-spinner-duration, ${this.duration}s) infinite linear;
          border-width: 1px;
          height: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 0.1);
          width: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 0.1);
        }

        @keyframes trinity-rings-spinner-circle1-animation{
          0%   { transform: rotateZ(20deg)  rotateY(0deg); }
          100% { transform: rotateZ(100deg) rotateY(360deg); }
        }

        @keyframes trinity-rings-spinner-circle2-animation{
          0%   { transform: rotateZ(100deg) rotateX(0deg); }
          100% { transform: rotateZ(0deg)   rotateX(360deg); }
        }

        @keyframes trinity-rings-spinner-circle3-animation{
          0%   { transform: rotateZ(100deg)  rotateX(-360deg); }
          100% { transform: rotateZ(-360deg) rotateX(360deg); }
        }
      </style>

      <div class="trinity-rings-spinner">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
    `;
    }
  }

  customElements.define(TrinityRingsSpinner.is, TrinityRingsSpinner);

  exports.AtomSpinner = AtomSpinner;
  exports.BreedingRhombusSpinner = BreedingRhombusSpinner;
  exports.CirclesToRhombusesSpinner = CirclesToRhombusesSpinner;
  exports.FingerprintSpinner = FingerprintSpinner;
  exports.FlowerSpinner = FlowerSpinner;
  exports.FulfillingBouncingCircleSpinner = FulfillingBouncingCircleSpinner;
  exports.FulfillingSquareSpinner = FulfillingSquareSpinner;
  exports.HalfCircleSpinner = HalfCircleSpinner;
  exports.HollowDotsSpinner = HollowDotsSpinner;
  exports.IntersectingCirclesSpinner = IntersectingCirclesSpinner;
  exports.LoopingRhombusesSpinner = LoopingRhombusesSpinner;
  exports.OrbitSpinner = OrbitSpinner;
  exports.PixelSpinner = PixelSpinner;
  exports.RadarSpinner = RadarSpinner;
  exports.ScalingSquaresSpinner = ScalingSquaresSpinner;
  exports.SelfBuildingSquareSpinner = SelfBuildingSquareSpinner;
  exports.SemipolarSpinner = SemipolarSpinner;
  exports.SpringSpinner = SpringSpinner;
  exports.SwappingSquaresSpinner = SwappingSquaresSpinner;
  exports.TrinityRingsSpinner = TrinityRingsSpinner;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9AcG9seW1lci9wb2x5bWVyL2xpYi91dGlscy9ib290LmpzIiwiLi4vbm9kZV9tb2R1bGVzL0Bwb2x5bWVyL3BvbHltZXIvbGliL3V0aWxzL21peGluLmpzIiwiLi4vbm9kZV9tb2R1bGVzL0Bwb2x5bWVyL3BvbHltZXIvbGliL3V0aWxzL2FzeW5jLmpzIiwiLi4vbm9kZV9tb2R1bGVzL0Bwb2x5bWVyL3BvbHltZXIvbGliL21peGlucy9wcm9wZXJ0aWVzLWNoYW5nZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvQHBvbHltZXIvcG9seW1lci9saWIvbWl4aW5zL3Byb3BlcnRpZXMtbWl4aW4uanMiLCIuLi9ub2RlX21vZHVsZXMvQHBvbHltZXIvcG9seW1lci9saWIvdXRpbHMvY2FzZS1tYXAuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGl0LWh0bWwuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL21vZGlmeS10ZW1wbGF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvc2hhZHktcmVuZGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9saXQtZXh0ZW5kZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvQHBvbHltZXIvbGl0LWVsZW1lbnQvbGl0LWVsZW1lbnQuanMiLCIuLi9zcmMvY29tcG9uZW50cy9BdG9tU3Bpbm5lci5qcyIsIi4uL3NyYy9jb21wb25lbnRzL0JyZWVkaW5nUmhvbWJ1c1NwaW5uZXIuanMiLCIuLi9zcmMvY29tcG9uZW50cy9DaXJjbGVzVG9SaG9tYnVzZXNTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvRmluZ2VycHJpbnRTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvRmxvd2VyU3Bpbm5lci5qcyIsIi4uL3NyYy9jb21wb25lbnRzL0Z1bGZpbGxpbmdCb3VuY2luZ0NpcmNsZVNwaW5uZXIuanMiLCIuLi9zcmMvY29tcG9uZW50cy9GdWxmaWxsaW5nU3F1YXJlU3Bpbm5lci5qcyIsIi4uL3NyYy9jb21wb25lbnRzL0hhbGZDaXJjbGVTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvSG9sbG93RG90c1NwaW5uZXIuanMiLCIuLi9zcmMvY29tcG9uZW50cy9JbnRlcnNlY3RpbmdDaXJjbGVzU3Bpbm5lci5qcyIsIi4uL3NyYy9jb21wb25lbnRzL0xvb3BpbmdSaG9tYnVzZXNTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvT3JiaXRTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvUGl4ZWxTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvUmFkYXJTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvU2NhbGluZ1NxdWFyZXNTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvU2VsZkJ1aWxkaW5nU3F1YXJlU3Bpbm5lci5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1NlbWlwb2xhclNwaW5uZXIuanMiLCIuLi9zcmMvY29tcG9uZW50cy9TcHJpbmdTcGlubmVyLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvU3dhcHBpbmdTcXVhcmVzU3Bpbm5lci5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1RyaW5pdHlSaW5nc1NwaW5uZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5AbGljZW5zZVxuQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcblRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG5UaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbkNvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG5zdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuKi9cblxud2luZG93LkpTQ29tcGlsZXJfcmVuYW1lUHJvcGVydHkgPSBmdW5jdGlvbihwcm9wKSB7IHJldHVybiBwcm9wOyB9O1xuIiwiLyoqXG5AbGljZW5zZVxuQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcblRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG5UaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbkNvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG5zdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuKi9cbmltcG9ydCAnLi9ib290LmpzJztcblxuLy8gdW5pcXVlIGdsb2JhbCBpZCBmb3IgZGVkdXBpbmcgbWl4aW5zLlxubGV0IGRlZHVwZUlkID0gMDtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIHtGdW5jdGlvbn1cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIE1peGluRnVuY3Rpb24oKXt9XG4vKiogQHR5cGUgeyhXZWFrTWFwIHwgdW5kZWZpbmVkKX0gKi9cbk1peGluRnVuY3Rpb24ucHJvdG90eXBlLl9fbWl4aW5BcHBsaWNhdGlvbnM7XG4vKiogQHR5cGUgeyhPYmplY3QgfCB1bmRlZmluZWQpfSAqL1xuTWl4aW5GdW5jdGlvbi5wcm90b3R5cGUuX19taXhpblNldDtcblxuLyogZXNsaW50LWRpc2FibGUgdmFsaWQtanNkb2MgKi9cbi8qKlxuICogV3JhcHMgYW4gRVM2IGNsYXNzIGV4cHJlc3Npb24gbWl4aW4gc3VjaCB0aGF0IHRoZSBtaXhpbiBpcyBvbmx5IGFwcGxpZWRcbiAqIGlmIGl0IGhhcyBub3QgYWxyZWFkeSBiZWVuIGFwcGxpZWQgaXRzIGJhc2UgYXJndW1lbnQuIEFsc28gbWVtb2l6ZXMgbWl4aW5cbiAqIGFwcGxpY2F0aW9ucy5cbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSBtaXhpbiBFUzYgY2xhc3MgZXhwcmVzc2lvbiBtaXhpbiB0byB3cmFwXG4gKiBAcmV0dXJuIHtUfVxuICogQHN1cHByZXNzIHtpbnZhbGlkQ2FzdHN9XG4gKi9cbmV4cG9ydCBjb25zdCBkZWR1cGluZ01peGluID0gZnVuY3Rpb24obWl4aW4pIHtcbiAgbGV0IG1peGluQXBwbGljYXRpb25zID0gLyoqIEB0eXBlIHshTWl4aW5GdW5jdGlvbn0gKi8obWl4aW4pLl9fbWl4aW5BcHBsaWNhdGlvbnM7XG4gIGlmICghbWl4aW5BcHBsaWNhdGlvbnMpIHtcbiAgICBtaXhpbkFwcGxpY2F0aW9ucyA9IG5ldyBXZWFrTWFwKCk7XG4gICAgLyoqIEB0eXBlIHshTWl4aW5GdW5jdGlvbn0gKi8obWl4aW4pLl9fbWl4aW5BcHBsaWNhdGlvbnMgPSBtaXhpbkFwcGxpY2F0aW9ucztcbiAgfVxuICAvLyBtYWludGFpbiBhIHVuaXF1ZSBpZCBmb3IgZWFjaCBtaXhpblxuICBsZXQgbWl4aW5EZWR1cGVJZCA9IGRlZHVwZUlkKys7XG4gIGZ1bmN0aW9uIGRlZHVwaW5nTWl4aW4oYmFzZSkge1xuICAgIGxldCBiYXNlU2V0ID0gLyoqIEB0eXBlIHshTWl4aW5GdW5jdGlvbn0gKi8oYmFzZSkuX19taXhpblNldDtcbiAgICBpZiAoYmFzZVNldCAmJiBiYXNlU2V0W21peGluRGVkdXBlSWRdKSB7XG4gICAgICByZXR1cm4gYmFzZTtcbiAgICB9XG4gICAgbGV0IG1hcCA9IG1peGluQXBwbGljYXRpb25zO1xuICAgIGxldCBleHRlbmRlZCA9IG1hcC5nZXQoYmFzZSk7XG4gICAgaWYgKCFleHRlbmRlZCkge1xuICAgICAgZXh0ZW5kZWQgPSAvKiogQHR5cGUgeyFGdW5jdGlvbn0gKi8obWl4aW4pKGJhc2UpO1xuICAgICAgbWFwLnNldChiYXNlLCBleHRlbmRlZCk7XG4gICAgfVxuICAgIC8vIGNvcHkgaW5oZXJpdGVkIG1peGluIHNldCBmcm9tIHRoZSBleHRlbmRlZCBjbGFzcywgb3IgdGhlIGJhc2UgY2xhc3NcbiAgICAvLyBOT1RFOiB3ZSBhdm9pZCB1c2Ugb2YgU2V0IGhlcmUgYmVjYXVzZSBzb21lIGJyb3dzZXIgKElFMTEpXG4gICAgLy8gY2Fubm90IGV4dGVuZCBhIGJhc2UgU2V0IHZpYSB0aGUgY29uc3RydWN0b3IuXG4gICAgbGV0IG1peGluU2V0ID0gT2JqZWN0LmNyZWF0ZSgvKiogQHR5cGUgeyFNaXhpbkZ1bmN0aW9ufSAqLyhleHRlbmRlZCkuX19taXhpblNldCB8fCBiYXNlU2V0IHx8IG51bGwpO1xuICAgIG1peGluU2V0W21peGluRGVkdXBlSWRdID0gdHJ1ZTtcbiAgICAvKiogQHR5cGUgeyFNaXhpbkZ1bmN0aW9ufSAqLyhleHRlbmRlZCkuX19taXhpblNldCA9IG1peGluU2V0O1xuICAgIHJldHVybiBleHRlbmRlZDtcbiAgfVxuXG4gIHJldHVybiBkZWR1cGluZ01peGluO1xufTtcbi8qIGVzbGludC1lbmFibGUgdmFsaWQtanNkb2MgKi9cbiIsIi8qKlxuQGxpY2Vuc2VcbkNvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5UaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG5UaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG5Db2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiovXG5cbi8qKlxuICogQGZpbGVvdmVydmlld1xuICpcbiAqIFRoaXMgbW9kdWxlIHByb3ZpZGVzIGEgbnVtYmVyIG9mIHN0cmF0ZWdpZXMgZm9yIGVucXVldWluZyBhc3luY2hyb25vdXNcbiAqIHRhc2tzLiBFYWNoIHN1Yi1tb2R1bGUgcHJvdmlkZXMgYSBzdGFuZGFyZCBgcnVuKGZuKWAgaW50ZXJmYWNlIHRoYXQgcmV0dXJucyBhXG4gKiBoYW5kbGUsIGFuZCBhIGBjYW5jZWwoaGFuZGxlKWAgaW50ZXJmYWNlIGZvciBjYW5jZWxpbmcgYXN5bmMgdGFza3MgYmVmb3JlXG4gKiB0aGV5IHJ1bi5cbiAqXG4gKiBAc3VtbWFyeSBNb2R1bGUgdGhhdCBwcm92aWRlcyBhIG51bWJlciBvZiBzdHJhdGVnaWVzIGZvciBlbnF1ZXVpbmdcbiAqIGFzeW5jaHJvbm91cyB0YXNrcy5cbiAqL1xuXG5pbXBvcnQgJy4vYm9vdC5qcyc7XG5cbi8vIE1pY3JvdGFzayBpbXBsZW1lbnRlZCB1c2luZyBNdXRhdGlvbiBPYnNlcnZlclxubGV0IG1pY3JvdGFza0N1cnJIYW5kbGUgPSAwO1xubGV0IG1pY3JvdGFza0xhc3RIYW5kbGUgPSAwO1xubGV0IG1pY3JvdGFza0NhbGxiYWNrcyA9IFtdO1xubGV0IG1pY3JvdGFza05vZGVDb250ZW50ID0gMDtcbmxldCBtaWNyb3Rhc2tOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyKG1pY3JvdGFza0ZsdXNoKS5vYnNlcnZlKG1pY3JvdGFza05vZGUsIHtjaGFyYWN0ZXJEYXRhOiB0cnVlfSk7XG5cbmZ1bmN0aW9uIG1pY3JvdGFza0ZsdXNoKCkge1xuICBjb25zdCBsZW4gPSBtaWNyb3Rhc2tDYWxsYmFja3MubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbGV0IGNiID0gbWljcm90YXNrQ2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRocm93IGU7IH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBtaWNyb3Rhc2tDYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG4gIG1pY3JvdGFza0xhc3RIYW5kbGUgKz0gbGVuO1xufVxuXG4vKipcbiAqIEFzeW5jIGludGVyZmFjZSB3cmFwcGVyIGFyb3VuZCBgc2V0VGltZW91dGAuXG4gKlxuICogQG5hbWVzcGFjZVxuICogQHN1bW1hcnkgQXN5bmMgaW50ZXJmYWNlIHdyYXBwZXIgYXJvdW5kIGBzZXRUaW1lb3V0YC5cbiAqL1xuY29uc3QgdGltZU91dCA9IHtcbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdWItbW9kdWxlIHdpdGggdGhlIGFzeW5jIGludGVyZmFjZSBwcm92aWRpbmcgdGhlIHByb3ZpZGVkXG4gICAqIGRlbGF5LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgdGltZU91dFxuICAgKiBAcGFyYW0ge251bWJlcj19IGRlbGF5IFRpbWUgdG8gd2FpdCBiZWZvcmUgY2FsbGluZyBjYWxsYmFja3MgaW4gbXNcbiAgICogQHJldHVybiB7IUFzeW5jSW50ZXJmYWNlfSBBbiBhc3luYyB0aW1lb3V0IGludGVyZmFjZVxuICAgKi9cbiAgYWZ0ZXIoZGVsYXkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcnVuKGZuKSB7IHJldHVybiB3aW5kb3cuc2V0VGltZW91dChmbiwgZGVsYXkpOyB9LFxuICAgICAgY2FuY2VsKGhhbmRsZSkge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgLyoqXG4gICAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGluIHRoZSBuZXh0IHRhc2suXG4gICAqXG4gICAqIEBtZW1iZXJvZiB0aW1lT3V0XG4gICAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBmbiBDYWxsYmFjayB0byBydW5cbiAgICogQHBhcmFtIHtudW1iZXI9fSBkZWxheSBEZWxheSBpbiBtaWxsaXNlY29uZHNcbiAgICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAgICovXG4gIHJ1bihmbiwgZGVsYXkpIHtcbiAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZm4sIGRlbGF5KTtcbiAgfSxcbiAgLyoqXG4gICAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGB0aW1lT3V0YCBjYWxsYmFjay5cbiAgICpcbiAgICogQG1lbWJlcm9mIHRpbWVPdXRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICovXG4gIGNhbmNlbChoYW5kbGUpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gIH1cbn07XG5leHBvcnQge3RpbWVPdXR9O1xuXG4vKipcbiAqIEFzeW5jIGludGVyZmFjZSB3cmFwcGVyIGFyb3VuZCBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYC5cbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAc3VtbWFyeSBBc3luYyBpbnRlcmZhY2Ugd3JhcHBlciBhcm91bmQgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAuXG4gKi9cbmNvbnN0IGFuaW1hdGlvbkZyYW1lID0ge1xuICAvKipcbiAgICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgdGltaW5nLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgYW5pbWF0aW9uRnJhbWVcbiAgICogQHBhcmFtIHtmdW5jdGlvbihudW1iZXIpOnZvaWR9IGZuIENhbGxiYWNrIHRvIHJ1blxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICAgKi9cbiAgcnVuKGZuKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZm4pO1xuICB9LFxuICAvKipcbiAgICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYGFuaW1hdGlvbkZyYW1lYCBjYWxsYmFjay5cbiAgICpcbiAgICogQG1lbWJlcm9mIGFuaW1hdGlvbkZyYW1lXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoYW5kbGUgSGFuZGxlIHJldHVybmVkIGZyb20gYHJ1bmAgb2YgY2FsbGJhY2sgdG8gY2FuY2VsXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqL1xuICBjYW5jZWwoaGFuZGxlKSB7XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGhhbmRsZSk7XG4gIH1cbn07XG5leHBvcnQge2FuaW1hdGlvbkZyYW1lfTtcblxuLyoqXG4gKiBBc3luYyBpbnRlcmZhY2Ugd3JhcHBlciBhcm91bmQgYHJlcXVlc3RJZGxlQ2FsbGJhY2tgLiAgRmFsbHMgYmFjayB0b1xuICogYHNldFRpbWVvdXRgIG9uIGJyb3dzZXJzIHRoYXQgZG8gbm90IHN1cHBvcnQgYHJlcXVlc3RJZGxlQ2FsbGJhY2tgLlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBzdW1tYXJ5IEFzeW5jIGludGVyZmFjZSB3cmFwcGVyIGFyb3VuZCBgcmVxdWVzdElkbGVDYWxsYmFja2AuXG4gKi9cbmNvbnN0IGlkbGVQZXJpb2QgPSB7XG4gIC8qKlxuICAgKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCBgcmVxdWVzdElkbGVDYWxsYmFja2AgdGltaW5nLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgaWRsZVBlcmlvZFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFJZGxlRGVhZGxpbmUpOnZvaWR9IGZuIENhbGxiYWNrIHRvIHJ1blxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICAgKi9cbiAgcnVuKGZuKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrID9cbiAgICAgIHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKGZuKSA6XG4gICAgICB3aW5kb3cuc2V0VGltZW91dChmbiwgMTYpO1xuICB9LFxuICAvKipcbiAgICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYGlkbGVQZXJpb2RgIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgaWRsZVBlcmlvZFxuICAgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKi9cbiAgY2FuY2VsKGhhbmRsZSkge1xuICAgIHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2sgP1xuICAgICAgd2luZG93LmNhbmNlbElkbGVDYWxsYmFjayhoYW5kbGUpIDpcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaGFuZGxlKTtcbiAgfVxufTtcbmV4cG9ydCB7aWRsZVBlcmlvZH07XG5cbi8qKlxuICogQXN5bmMgaW50ZXJmYWNlIGZvciBlbnF1ZXVpbmcgY2FsbGJhY2tzIHRoYXQgcnVuIGF0IG1pY3JvdGFzayB0aW1pbmcuXG4gKlxuICogTm90ZSB0aGF0IG1pY3JvdGFzayB0aW1pbmcgaXMgYWNoaWV2ZWQgdmlhIGEgc2luZ2xlIGBNdXRhdGlvbk9ic2VydmVyYCxcbiAqIGFuZCB0aHVzIGNhbGxiYWNrcyBlbnF1ZXVlZCB3aXRoIHRoaXMgQVBJIHdpbGwgYWxsIHJ1biBpbiBhIHNpbmdsZVxuICogYmF0Y2gsIGFuZCBub3QgaW50ZXJsZWF2ZWQgd2l0aCBvdGhlciBtaWNyb3Rhc2tzIHN1Y2ggYXMgcHJvbWlzZXMuXG4gKiBQcm9taXNlcyBhcmUgYXZvaWRlZCBhcyBhbiBpbXBsZW1lbnRhdGlvbiBjaG9pY2UgZm9yIHRoZSB0aW1lIGJlaW5nXG4gKiBkdWUgdG8gU2FmYXJpIGJ1Z3MgdGhhdCBjYXVzZSBQcm9taXNlcyB0byBsYWNrIG1pY3JvdGFzayBndWFyYW50ZWVzLlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBzdW1tYXJ5IEFzeW5jIGludGVyZmFjZSBmb3IgZW5xdWV1aW5nIGNhbGxiYWNrcyB0aGF0IHJ1biBhdCBtaWNyb3Rhc2tcbiAqICAgdGltaW5nLlxuICovXG5jb25zdCBtaWNyb1Rhc2sgPSB7XG5cbiAgLyoqXG4gICAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGF0IG1pY3JvdGFzayB0aW1pbmcuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBtaWNyb1Rhc2tcbiAgICogQHBhcmFtIHshRnVuY3Rpb249fSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAgICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAgICovXG4gIHJ1bihjYWxsYmFjaykge1xuICAgIG1pY3JvdGFza05vZGUudGV4dENvbnRlbnQgPSBtaWNyb3Rhc2tOb2RlQ29udGVudCsrO1xuICAgIG1pY3JvdGFza0NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbWljcm90YXNrQ3VyckhhbmRsZSsrO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgbWljcm9UYXNrYCBjYWxsYmFjay5cbiAgICpcbiAgICogQG1lbWJlcm9mIG1pY3JvVGFza1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKi9cbiAgY2FuY2VsKGhhbmRsZSkge1xuICAgIGNvbnN0IGlkeCA9IGhhbmRsZSAtIG1pY3JvdGFza0xhc3RIYW5kbGU7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBpZiAoIW1pY3JvdGFza0NhbGxiYWNrc1tpZHhdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuICAgICAgfVxuICAgICAgbWljcm90YXNrQ2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICAgIH1cbiAgfVxuXG59O1xuZXhwb3J0IHttaWNyb1Rhc2t9O1xuIiwiLyoqXG5AbGljZW5zZVxuQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcblRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG5UaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbkNvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG5zdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuKi9cbmltcG9ydCAnLi4vdXRpbHMvYm9vdC5qcyc7XG5cbmltcG9ydCB7IGRlZHVwaW5nTWl4aW4gfSBmcm9tICcuLi91dGlscy9taXhpbi5qcyc7XG5pbXBvcnQgeyBtaWNyb1Rhc2sgfSBmcm9tICcuLi91dGlscy9hc3luYy5qcyc7XG5cbi8qKiBAY29uc3QgeyFBc3luY0ludGVyZmFjZX0gKi9cbmNvbnN0IG1pY3JvdGFzayA9IG1pY3JvVGFzaztcblxuLyoqXG4gKiBFbGVtZW50IGNsYXNzIG1peGluIHRoYXQgcHJvdmlkZXMgYmFzaWMgbWV0YS1wcm9ncmFtbWluZyBmb3IgY3JlYXRpbmcgb25lXG4gKiBvciBtb3JlIHByb3BlcnR5IGFjY2Vzc29ycyAoZ2V0dGVyL3NldHRlciBwYWlyKSB0aGF0IGVucXVldWUgYW4gYXN5bmNcbiAqIChiYXRjaGVkKSBgX3Byb3BlcnRpZXNDaGFuZ2VkYCBjYWxsYmFjay5cbiAqXG4gKiBGb3IgYmFzaWMgdXNhZ2Ugb2YgdGhpcyBtaXhpbiwgY2FsbCBgTXlDbGFzcy5jcmVhdGVQcm9wZXJ0aWVzKHByb3BzKWBcbiAqIG9uY2UgYXQgY2xhc3MgZGVmaW5pdGlvbiB0aW1lIHRvIGNyZWF0ZSBwcm9wZXJ0eSBhY2Nlc3NvcnMgZm9yIHByb3BlcnRpZXNcbiAqIG5hbWVkIGluIHByb3BzLCBpbXBsZW1lbnQgYF9wcm9wZXJ0aWVzQ2hhbmdlZGAgdG8gcmVhY3QgYXMgZGVzaXJlZCB0b1xuICogcHJvcGVydHkgY2hhbmdlcywgYW5kIGltcGxlbWVudCBgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKWAgYW5kXG4gKiBpbmNsdWRlIGxvd2VyY2FzZSB2ZXJzaW9ucyBvZiBhbnkgcHJvcGVydHkgbmFtZXMgdGhhdCBzaG91bGQgYmUgc2V0IGZyb21cbiAqIGF0dHJpYnV0ZXMuIExhc3QsIGNhbGwgYHRoaXMuX2VuYWJsZVByb3BlcnRpZXMoKWAgaW4gdGhlIGVsZW1lbnQnc1xuICogYGNvbm5lY3RlZENhbGxiYWNrYCB0byBlbmFibGUgdGhlIGFjY2Vzc29ycy5cbiAqXG4gKiBAbWl4aW5GdW5jdGlvblxuICogQHBvbHltZXJcbiAqIEBzdW1tYXJ5IEVsZW1lbnQgY2xhc3MgbWl4aW4gZm9yIHJlYWN0aW5nIHRvIHByb3BlcnR5IGNoYW5nZXMgZnJvbVxuICogICBnZW5lcmF0ZWQgcHJvcGVydHkgYWNjZXNzb3JzLlxuICovXG5leHBvcnQgY29uc3QgUHJvcGVydGllc0NoYW5nZWQgPSBkZWR1cGluZ01peGluKFxuICAgIC8qKlxuICAgICAqIEB0ZW1wbGF0ZSBUXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihuZXc6VCl9IHN1cGVyQ2xhc3MgQ2xhc3MgdG8gYXBwbHkgbWl4aW4gdG8uXG4gICAgICogQHJldHVybiB7ZnVuY3Rpb24obmV3OlQpfSBzdXBlckNsYXNzIHdpdGggbWl4aW4gYXBwbGllZC5cbiAgICAgKi9cbiAgICAoc3VwZXJDbGFzcykgPT4ge1xuXG4gIC8qKlxuICAgKiBAcG9seW1lclxuICAgKiBAbWl4aW5DbGFzc1xuICAgKiBAaW1wbGVtZW50cyB7UG9seW1lcl9Qcm9wZXJ0aWVzQ2hhbmdlZH1cbiAgICogQHVucmVzdHJpY3RlZFxuICAgKi9cbiAgY2xhc3MgUHJvcGVydGllc0NoYW5nZWQgZXh0ZW5kcyBzdXBlckNsYXNzIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgcHJvcGVydHkgYWNjZXNzb3JzIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHkgbmFtZXMuXG4gICAgICogQHBhcmFtIHshT2JqZWN0fSBwcm9wcyBPYmplY3Qgd2hvc2Uga2V5cyBhcmUgbmFtZXMgb2YgYWNjZXNzb3JzLlxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKHByb3BzKSB7XG4gICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgZm9yIChsZXQgcHJvcCBpbiBwcm9wcykge1xuICAgICAgICAvLyBkb24ndCBzdG9tcCBhbiBleGlzdGluZyBhY2Nlc3NvclxuICAgICAgICBpZiAoIShwcm9wIGluIHByb3RvKSkge1xuICAgICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3ApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhdHRyaWJ1dGUgbmFtZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBnaXZlbiBwcm9wZXJ0eS5cbiAgICAgKiBUaGUgYXR0cmlidXRlIG5hbWUgaXMgdGhlIGxvd2VyY2FzZWQgcHJvcGVydHkgbmFtZS4gT3ZlcnJpZGUgdG9cbiAgICAgKiBjdXN0b21pemUgdGhpcyBtYXBwaW5nLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBQcm9wZXJ0eSB0byBjb252ZXJ0XG4gICAgICogQHJldHVybiB7c3RyaW5nfSBBdHRyaWJ1dGUgbmFtZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBzdGF0aWMgYXR0cmlidXRlTmFtZUZvclByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJvcGVydHkudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSBwb2ludCB0byBwcm92aWRlIGEgdHlwZSB0byB3aGljaCB0byBkZXNlcmlhbGl6ZSBhIHZhbHVlIHRvXG4gICAgICogYSBnaXZlbiBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lIG9mIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgc3RhdGljIHR5cGVGb3JQcm9wZXJ0eShuYW1lKSB7IH0gLy9lc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc2V0dGVyL2dldHRlciBwYWlyIGZvciB0aGUgbmFtZWQgcHJvcGVydHkgd2l0aCBpdHMgb3duXG4gICAgICogbG9jYWwgc3RvcmFnZS4gIFRoZSBnZXR0ZXIgcmV0dXJucyB0aGUgdmFsdWUgaW4gdGhlIGxvY2FsIHN0b3JhZ2UsXG4gICAgICogYW5kIHRoZSBzZXR0ZXIgY2FsbHMgYF9zZXRQcm9wZXJ0eWAsIHdoaWNoIHVwZGF0ZXMgdGhlIGxvY2FsIHN0b3JhZ2VcbiAgICAgKiBmb3IgdGhlIHByb3BlcnR5IGFuZCBlbnF1ZXVlcyBhIGBfcHJvcGVydGllc0NoYW5nZWRgIGNhbGxiYWNrLlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBvbiBhIHByb3RvdHlwZSBvciBhbiBpbnN0YW5jZS4gIENhbGxpbmdcbiAgICAgKiB0aGlzIG1ldGhvZCBtYXkgb3ZlcndyaXRlIGEgcHJvcGVydHkgdmFsdWUgdGhhdCBhbHJlYWR5IGV4aXN0cyBvblxuICAgICAqIHRoZSBwcm90b3R5cGUvaW5zdGFuY2UgYnkgY3JlYXRpbmcgdGhlIGFjY2Vzc29yLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IE5hbWUgb2YgdGhlIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gcmVhZE9ubHkgV2hlbiB0cnVlLCBubyBzZXR0ZXIgaXMgY3JlYXRlZDsgdGhlXG4gICAgICogICBwcm90ZWN0ZWQgYF9zZXRQcm9wZXJ0eWAgZnVuY3Rpb24gbXVzdCBiZSB1c2VkIHRvIHNldCB0aGUgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIHRoaXMuX2FkZFByb3BlcnR5VG9BdHRyaWJ1dGVNYXAocHJvcGVydHkpO1xuICAgICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KCdfX2RhdGFIYXNBY2Nlc3NvcicpKSB7XG4gICAgICAgIHRoaXMuX19kYXRhSGFzQWNjZXNzb3IgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9fZGF0YUhhc0FjY2Vzc29yKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5fX2RhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgdGhpcy5fX2RhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0gPSB0cnVlO1xuICAgICAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCByZWFkT25seSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgZ2l2ZW4gYHByb3BlcnR5YCB0byBhIG1hcCBtYXRjaGluZyBhdHRyaWJ1dGUgbmFtZXNcbiAgICAgKiB0byBwcm9wZXJ0eSBuYW1lcywgdXNpbmcgYGF0dHJpYnV0ZU5hbWVGb3JQcm9wZXJ0eWAuIFRoaXMgbWFwIGlzXG4gICAgICogdXNlZCB3aGVuIGRlc2VyaWFsaXppbmcgYXR0cmlidXRlIHZhbHVlcyB0byBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IE5hbWUgb2YgdGhlIHByb3BlcnR5XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX2FkZFByb3BlcnR5VG9BdHRyaWJ1dGVNYXAocHJvcGVydHkpIHtcbiAgICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eSgnX19kYXRhQXR0cmlidXRlcycpKSB7XG4gICAgICAgIHRoaXMuX19kYXRhQXR0cmlidXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX19kYXRhQXR0cmlidXRlcyk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX19kYXRhQXR0cmlidXRlc1twcm9wZXJ0eV0pIHtcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlTmFtZUZvclByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgdGhpcy5fX2RhdGFBdHRyaWJ1dGVzW2F0dHJdID0gcHJvcGVydHk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVmaW5lcyBhIHByb3BlcnR5IGFjY2Vzc29yIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IE5hbWUgb2YgdGhlIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gcmVhZE9ubHkgV2hlbiB0cnVlLCBubyBzZXR0ZXIgaXMgY3JlYXRlZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgIF9kZWZpbmVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCByZWFkT25seSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIHZhbGlkLWpzZG9jICovXG4gICAgICAgIC8qKiBAdGhpcyB7UHJvcGVydGllc0NoYW5nZWR9ICovXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICB9LFxuICAgICAgICAvKiogQHRoaXMge1Byb3BlcnRpZXNDaGFuZ2VkfSAqL1xuICAgICAgICBzZXQ6IHJlYWRPbmx5ID8gZnVuY3Rpb24gKCkge30gOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgKi9cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuX19kYXRhRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fX2RhdGFSZWFkeSA9IGZhbHNlO1xuICAgICAgdGhpcy5fX2RhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICB0aGlzLl9fZGF0YSA9IHt9O1xuICAgICAgdGhpcy5fX2RhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgIHRoaXMuX19kYXRhT2xkID0gbnVsbDtcbiAgICAgIHRoaXMuX19kYXRhSW5zdGFuY2VQcm9wcyA9IG51bGw7XG4gICAgICB0aGlzLl9fc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGlmZWN5Y2xlIGNhbGxiYWNrIGNhbGxlZCB3aGVuIHByb3BlcnRpZXMgYXJlIGVuYWJsZWQgdmlhXG4gICAgICogYF9lbmFibGVQcm9wZXJ0aWVzYC5cbiAgICAgKlxuICAgICAqIFVzZXJzIG1heSBvdmVycmlkZSB0aGlzIGZ1bmN0aW9uIHRvIGltcGxlbWVudCBiZWhhdmlvciB0aGF0IGlzXG4gICAgICogZGVwZW5kZW50IG9uIHRoZSBlbGVtZW50IGhhdmluZyBpdHMgcHJvcGVydHkgZGF0YSBpbml0aWFsaXplZCwgZS5nLlxuICAgICAqIGZyb20gZGVmYXVsdHMgKGluaXRpYWxpemVkIGZyb20gYGNvbnN0cnVjdG9yYCwgYF9pbml0aWFsaXplUHJvcGVydGllc2ApLFxuICAgICAqIGBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2tgLCBvciB2YWx1ZXMgcHJvcGFnYXRlZCBmcm9tIGhvc3QgZS5nLiB2aWFcbiAgICAgKiBiaW5kaW5ncy4gIGBzdXBlci5yZWFkeSgpYCBtdXN0IGJlIGNhbGxlZCB0byBlbnN1cmUgdGhlIGRhdGEgc3lzdGVtXG4gICAgICogYmVjb21lcyBlbmFibGVkLlxuICAgICAqXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKiBAcHVibGljXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgcmVhZHkoKSB7XG4gICAgICB0aGlzLl9fZGF0YVJlYWR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBsb2NhbCBzdG9yYWdlIGZvciBwcm9wZXJ0eSBhY2Nlc3NvcnMuXG4gICAgICpcbiAgICAgKiBQcm92aWRlZCBhcyBhbiBvdmVycmlkZSBwb2ludCBmb3IgcGVyZm9ybWluZyBhbnkgc2V0dXAgd29yayBwcmlvclxuICAgICAqIHRvIGluaXRpYWxpemluZyB0aGUgcHJvcGVydHkgYWNjZXNzb3Igc3lzdGVtLlxuICAgICAqXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemVQcm9wZXJ0aWVzKCkge1xuICAgICAgLy8gQ2FwdHVyZSBpbnN0YW5jZSBwcm9wZXJ0aWVzOyB0aGVzZSB3aWxsIGJlIHNldCBpbnRvIGFjY2Vzc29yc1xuICAgICAgLy8gZHVyaW5nIGZpcnN0IGZsdXNoLiBEb24ndCBzZXQgdGhlbSBoZXJlLCBzaW5jZSB3ZSB3YW50XG4gICAgICAvLyB0aGVzZSB0byBvdmVyd3JpdGUgZGVmYXVsdHMvY29uc3RydWN0b3IgYXNzaWdubWVudHNcbiAgICAgIGZvciAobGV0IHAgaW4gdGhpcy5fX2RhdGFIYXNBY2Nlc3Nvcikge1xuICAgICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgICAgIHRoaXMuX19kYXRhSW5zdGFuY2VQcm9wcyA9IHRoaXMuX19kYXRhSW5zdGFuY2VQcm9wcyB8fCB7fTtcbiAgICAgICAgICB0aGlzLl9fZGF0YUluc3RhbmNlUHJvcHNbcF0gPSB0aGlzW3BdO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGF0IHJlYWR5IHRpbWUgd2l0aCBiYWcgb2YgaW5zdGFuY2UgcHJvcGVydGllcyB0aGF0IG92ZXJ3cm90ZVxuICAgICAqIGFjY2Vzc29ycyB3aGVuIHRoZSBlbGVtZW50IHVwZ3JhZGVkLlxuICAgICAqXG4gICAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gc2V0cyB0aGVzZSBwcm9wZXJ0aWVzIGJhY2sgaW50byB0aGVcbiAgICAgKiBzZXR0ZXIgYXQgcmVhZHkgdGltZS4gIFRoaXMgbWV0aG9kIGlzIHByb3ZpZGVkIGFzIGFuIG92ZXJyaWRlXG4gICAgICogcG9pbnQgZm9yIGN1c3RvbWl6aW5nIG9yIHByb3ZpZGluZyBtb3JlIGVmZmljaWVudCBpbml0aWFsaXphdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyBCYWcgb2YgcHJvcGVydHkgdmFsdWVzIHRoYXQgd2VyZSBvdmVyd3JpdHRlblxuICAgICAqICAgd2hlbiBjcmVhdGluZyBwcm9wZXJ0eSBhY2Nlc3NvcnMuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemVJbnN0YW5jZVByb3BlcnRpZXMocHJvcHMpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgcHJvcHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGxvY2FsIHN0b3JhZ2UgZm9yIGEgcHJvcGVydHkgKHZpYSBgX3NldFBlbmRpbmdQcm9wZXJ0eWApXG4gICAgICogYW5kIGVucXVldWVzIGEgYF9wcm9lcHJ0aWVzQ2hhbmdlZGAgY2FsbGJhY2suXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgTmFtZSBvZiB0aGUgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFZhbHVlIHRvIHNldFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIHZhbHVlKSkge1xuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlUHJvcGVydGllcygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IE5hbWUgb2YgcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHsqfSBWYWx1ZSBmb3IgdGhlIGdpdmVuIHByb3BlcnR5XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIHRoaXMuX19kYXRhW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGxvY2FsIHN0b3JhZ2UgZm9yIGEgcHJvcGVydHksIHJlY29yZHMgdGhlIHByZXZpb3VzIHZhbHVlLFxuICAgICAqIGFuZCBhZGRzIGl0IHRvIHRoZSBzZXQgb2YgXCJwZW5kaW5nIGNoYW5nZXNcIiB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRoZVxuICAgICAqIGBfcHJvcGVydGllc0NoYW5nZWRgIGNhbGxiYWNrLiAgVGhpcyBtZXRob2QgZG9lcyBub3QgZW5xdWV1ZSB0aGVcbiAgICAgKiBgX3Byb3BlcnRpZXNDaGFuZ2VkYCBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBOYW1lIG9mIHRoZSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVmFsdWUgdG8gc2V0XG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gZXh0IE5vdCB1c2VkIGhlcmU7IGFmZm9yZGFuY2UgZm9yIGNsb3N1cmVcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgdGhlIHByb3BlcnR5IGNoYW5nZWRcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUsIGV4dCkge1xuICAgICAgbGV0IG9sZCA9IHRoaXMuX19kYXRhW3Byb3BlcnR5XTtcbiAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5fc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpO1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9fZGF0YVBlbmRpbmcpIHtcbiAgICAgICAgICB0aGlzLl9fZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICB0aGlzLl9fZGF0YU9sZCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuc3VyZSBvbGQgaXMgY2FwdHVyZWQgZnJvbSB0aGUgbGFzdCB0dXJuXG4gICAgICAgIGlmICh0aGlzLl9fZGF0YU9sZCAmJiAhKHByb3BlcnR5IGluIHRoaXMuX19kYXRhT2xkKSkge1xuICAgICAgICAgIHRoaXMuX19kYXRhT2xkW3Byb3BlcnR5XSA9IG9sZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9fZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fX2RhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuICAgIC8qIGVzbGludC1lbmFibGUgKi9cblxuICAgIC8qKlxuICAgICAqIE1hcmtzIHRoZSBwcm9wZXJ0aWVzIGFzIGludmFsaWQsIGFuZCBlbnF1ZXVlcyBhbiBhc3luY1xuICAgICAqIGBfcHJvcGVydGllc0NoYW5nZWRgIGNhbGxiYWNrLlxuICAgICAqXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCF0aGlzLl9fZGF0YUludmFsaWQgJiYgdGhpcy5fX2RhdGFSZWFkeSkge1xuICAgICAgICB0aGlzLl9fZGF0YUludmFsaWQgPSB0cnVlO1xuICAgICAgICBtaWNyb3Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5fX2RhdGFJbnZhbGlkKSB7XG4gICAgICAgICAgICB0aGlzLl9fZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbCB0byBlbmFibGUgcHJvcGVydHkgYWNjZXNzb3IgcHJvY2Vzc2luZy4gQmVmb3JlIHRoaXMgbWV0aG9kIGlzXG4gICAgICogY2FsbGVkIGFjY2Vzc29yIHZhbHVlcyB3aWxsIGJlIHNldCBidXQgc2lkZSBlZmZlY3RzIGFyZVxuICAgICAqIHF1ZXVlZC4gV2hlbiBjYWxsZWQsIGFueSBwZW5kaW5nIHNpZGUgZWZmZWN0cyBvY2N1ciBpbW1lZGlhdGVseS5cbiAgICAgKiBGb3IgZWxlbWVudHMsIGdlbmVyYWxseSBgY29ubmVjdGVkQ2FsbGJhY2tgIGlzIGEgbm9ybWFsIHNwb3QgdG8gZG8gc28uXG4gICAgICogSXQgaXMgc2FmZSB0byBjYWxsIHRoaXMgbWV0aG9kIG11bHRpcGxlIHRpbWVzIGFzIGl0IG9ubHkgdHVybnMgb25cbiAgICAgKiBwcm9wZXJ0eSBhY2Nlc3NvcnMgb25jZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIF9lbmFibGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCF0aGlzLl9fZGF0YUVuYWJsZWQpIHtcbiAgICAgICAgdGhpcy5fX2RhdGFFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuX19kYXRhSW5zdGFuY2VQcm9wcykge1xuICAgICAgICAgIHRoaXMuX2luaXRpYWxpemVJbnN0YW5jZVByb3BlcnRpZXModGhpcy5fX2RhdGFJbnN0YW5jZVByb3BzKTtcbiAgICAgICAgICB0aGlzLl9fZGF0YUluc3RhbmNlUHJvcHMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxscyB0aGUgYF9wcm9wZXJ0aWVzQ2hhbmdlZGAgY2FsbGJhY2sgd2l0aCB0aGUgY3VycmVudCBzZXQgb2ZcbiAgICAgKiBwZW5kaW5nIGNoYW5nZXMgKGFuZCBvbGQgdmFsdWVzIHJlY29yZGVkIHdoZW4gcGVuZGluZyBjaGFuZ2VzIHdlcmVcbiAgICAgKiBzZXQpLCBhbmQgcmVzZXRzIHRoZSBwZW5kaW5nIHNldCBvZiBjaGFuZ2VzLiBHZW5lcmFsbHksIHRoaXMgbWV0aG9kXG4gICAgICogc2hvdWxkIG5vdCBiZSBjYWxsZWQgaW4gdXNlciBjb2RlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5fX2RhdGE7XG4gICAgICBjb25zdCBjaGFuZ2VkUHJvcHMgPSB0aGlzLl9fZGF0YVBlbmRpbmc7XG4gICAgICBjb25zdCBvbGQgPSB0aGlzLl9fZGF0YU9sZDtcbiAgICAgIGlmICh0aGlzLl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCkpIHtcbiAgICAgICAgdGhpcy5fX2RhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgICAgdGhpcy5fX2RhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcm9wZXJ0aWVzQ2hhbmdlZChwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCBpbiBgX2ZsdXNoUHJvcGVydGllc2AgdG8gZGV0ZXJtaW5lIGlmIGBfcHJvcGVydGllc0NoYW5nZWRgXG4gICAgICogc2hvdWxkIGJlIGNhbGxlZC4gVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gcmV0dXJucyB0cnVlIGlmXG4gICAgICogcHJvcGVydGllcyBhcmUgcGVuZGluZy4gT3ZlcnJpZGUgdG8gY3VzdG9taXplIHdoZW5cbiAgICAgKiBgX3Byb3BlcnRpZXNDaGFuZ2VkYCBpcyBjYWxsZWQuXG4gICAgICogQHBhcmFtIHshT2JqZWN0fSBjdXJyZW50UHJvcHMgQmFnIG9mIGFsbCBjdXJyZW50IGFjY2Vzc29yIHZhbHVlc1xuICAgICAqIEBwYXJhbSB7P09iamVjdH0gY2hhbmdlZFByb3BzIEJhZyBvZiBwcm9wZXJ0aWVzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3RcbiAgICAgKiAgIGNhbGwgdG8gYF9wcm9wZXJ0aWVzQ2hhbmdlZGBcbiAgICAgKiBAcGFyYW0gez9PYmplY3R9IG9sZFByb3BzIEJhZyBvZiBwcmV2aW91cyB2YWx1ZXMgZm9yIGVhY2ggcHJvcGVydHlcbiAgICAgKiAgIGluIGBjaGFuZ2VkUHJvcHNgXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBjaGFuZ2VkUHJvcHMgaXMgdHJ1dGh5XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICAgIHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYW55IHByb3BlcnRpZXMgd2l0aCBhY2Nlc3NvcnMgY3JlYXRlZCB2aWFcbiAgICAgKiBgX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3JgIGhhdmUgYmVlbiBzZXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0geyFPYmplY3R9IGN1cnJlbnRQcm9wcyBCYWcgb2YgYWxsIGN1cnJlbnQgYWNjZXNzb3IgdmFsdWVzXG4gICAgICogQHBhcmFtIHs/T2JqZWN0fSBjaGFuZ2VkUHJvcHMgQmFnIG9mIHByb3BlcnRpZXMgY2hhbmdlZCBzaW5jZSB0aGUgbGFzdFxuICAgICAqICAgY2FsbCB0byBgX3Byb3BlcnRpZXNDaGFuZ2VkYFxuICAgICAqIEBwYXJhbSB7P09iamVjdH0gb2xkUHJvcHMgQmFnIG9mIHByZXZpb3VzIHZhbHVlcyBmb3IgZWFjaCBwcm9wZXJ0eVxuICAgICAqICAgaW4gYGNoYW5nZWRQcm9wc2BcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfcHJvcGVydGllc0NoYW5nZWQoY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgY2FsbGVkIHRvIGRldGVybWluZSB3aGV0aGVyIGEgcHJvcGVydHkgdmFsdWUgc2hvdWxkIGJlXG4gICAgICogY29uc2lkZXJlZCBhcyBhIGNoYW5nZSBhbmQgY2F1c2UgdGhlIGBfcHJvcGVydGllc0NoYW5nZWRgIGNhbGxiYWNrXG4gICAgICogdG8gYmUgZW5xdWV1ZWQuXG4gICAgICpcbiAgICAgKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIGB0cnVlYCBpZiBhIHN0cmljdCBlcXVhbGl0eVxuICAgICAqIGNoZWNrIGZhaWxzLiBUaGUgbWV0aG9kIGFsd2F5cyByZXR1cm5zIGZhbHNlIGZvciBgTmFOYC5cbiAgICAgKlxuICAgICAqIE92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGUuZy4gcHJvdmlkZSBzdHJpY3RlciBjaGVja2luZyBmb3JcbiAgICAgKiBPYmplY3RzL0FycmF5cyB3aGVuIHVzaW5nIGltbXV0YWJsZSBwYXR0ZXJucy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBQcm9wZXJ0eSBuYW1lXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBOZXcgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0geyp9IG9sZCBQcmV2aW91cyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHByb3BlcnR5IHNob3VsZCBiZSBjb25zaWRlcmVkIGEgY2hhbmdlXG4gICAgICogICBhbmQgZW5xdWV1ZSBhIGBfcHJvZXBydGllc0NoYW5nZWRgIGNhbGxiYWNrXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIChvbGQgIT09IHZhbHVlICYmXG4gICAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgICAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW1wbGVtZW50cyBuYXRpdmUgQ3VzdG9tIEVsZW1lbnRzIGBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2tgIHRvXG4gICAgICogc2V0IGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBhIHByb3BlcnR5IHZpYSBgX2F0dHJpYnV0ZVRvUHJvcGVydHlgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBvZiBhdHRyaWJ1dGUgdGhhdCBjaGFuZ2VkXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBvbGQgT2xkIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gdmFsdWUgTmV3IGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gbmFtZXNwYWNlIEF0dHJpYnV0ZSBuYW1lc3BhY2UuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKiBAc3VwcHJlc3Mge21pc3NpbmdQcm9wZXJ0aWVzfSBTdXBlciBtYXkgb3IgbWF5IG5vdCBpbXBsZW1lbnQgdGhlIGNhbGxiYWNrXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWUsIG9sZCwgdmFsdWUsIG5hbWVzcGFjZSkge1xuICAgICAgaWYgKG9sZCAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5fYXR0cmlidXRlVG9Qcm9wZXJ0eShuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoc3VwZXIuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKSB7XG4gICAgICAgIHN1cGVyLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGQsIHZhbHVlLCBuYW1lc3BhY2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlc2VyaWFsaXplcyBhbiBhdHRyaWJ1dGUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBjYWxscyB0aGUgYF9kZXNlcmlhbGl6ZVZhbHVlYCBtZXRob2QgdG8gY29udmVydCB0aGUgc3RyaW5nIHRvXG4gICAgICogYSB0eXBlZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyaWJ1dGUgTmFtZSBvZiBhdHRyaWJ1dGUgdG8gZGVzZXJpYWxpemUuXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlLlxuICAgICAqIEBwYXJhbSB7Kj19IHR5cGUgdHlwZSB0byBkZXNlcmlhbGl6ZSB0bywgZGVmYXVsdHMgdG8gdGhlIHZhbHVlXG4gICAgICogcmV0dXJuZWQgZnJvbSBgdHlwZUZvclByb3BlcnR5YFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSwgdHlwZSkge1xuICAgICAgaWYgKCF0aGlzLl9fc2VyaWFsaXppbmcpIHtcbiAgICAgICAgY29uc3QgbWFwID0gdGhpcy5fX2RhdGFBdHRyaWJ1dGVzO1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IG1hcCAmJiBtYXBbYXR0cmlidXRlXSB8fCBhdHRyaWJ1dGU7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZSh2YWx1ZSwgdHlwZSB8fFxuICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IudHlwZUZvclByb3BlcnR5KHByb3BlcnR5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VyaWFsaXplcyBhIHByb3BlcnR5IHRvIGl0cyBhc3NvY2lhdGVkIGF0dHJpYnV0ZS5cbiAgICAgKlxuICAgICAqIEBzdXBwcmVzcyB7aW52YWxpZENhc3RzfSBDbG9zdXJlIGNhbid0IGZpZ3VyZSBvdXQgYHRoaXNgIGlzIGFuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgUHJvcGVydHkgbmFtZSB0byByZWZsZWN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nPX0gYXR0cmlidXRlIEF0dHJpYnV0ZSBuYW1lIHRvIHJlZmxlY3QgdG8uXG4gICAgICogQHBhcmFtIHsqPX0gdmFsdWUgUHJvcGVydHkgdmFsdWUgdG8gcmVmZWN0LlxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgIHRoaXMuX19zZXJpYWxpemluZyA9IHRydWU7XG4gICAgICB2YWx1ZSA9IChhcmd1bWVudHMubGVuZ3RoIDwgMykgPyB0aGlzW3Byb3BlcnR5XSA6IHZhbHVlO1xuICAgICAgdGhpcy5fdmFsdWVUb05vZGVBdHRyaWJ1dGUoLyoqIEB0eXBlIHshSFRNTEVsZW1lbnR9ICovKHRoaXMpLCB2YWx1ZSxcbiAgICAgICAgYXR0cmlidXRlIHx8IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlTmFtZUZvclByb3BlcnR5KHByb3BlcnR5KSk7XG4gICAgICB0aGlzLl9fc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdHlwZWQgdmFsdWUgdG8gYW4gSFRNTCBhdHRyaWJ1dGUgb24gYSBub2RlLlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgY2FsbHMgdGhlIGBfc2VyaWFsaXplVmFsdWVgIG1ldGhvZCB0byBjb252ZXJ0IHRoZSB0eXBlZFxuICAgICAqIHZhbHVlIHRvIGEgc3RyaW5nLiAgSWYgdGhlIGBfc2VyaWFsaXplVmFsdWVgIG1ldGhvZCByZXR1cm5zIGB1bmRlZmluZWRgLFxuICAgICAqIHRoZSBhdHRyaWJ1dGUgd2lsbCBiZSByZW1vdmVkICh0aGlzIGlzIHRoZSBkZWZhdWx0IGZvciBib29sZWFuXG4gICAgICogdHlwZSBgZmFsc2VgKS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gbm9kZSBFbGVtZW50IHRvIHNldCBhdHRyaWJ1dGUgdG8uXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBWYWx1ZSB0byBzZXJpYWxpemUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZSBBdHRyaWJ1dGUgbmFtZSB0byBzZXJpYWxpemUgdG8uXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfdmFsdWVUb05vZGVBdHRyaWJ1dGUobm9kZSwgdmFsdWUsIGF0dHJpYnV0ZSkge1xuICAgICAgY29uc3Qgc3RyID0gdGhpcy5fc2VyaWFsaXplVmFsdWUodmFsdWUpO1xuICAgICAgaWYgKHN0ciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHN0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSB0eXBlZCBKYXZhU2NyaXB0IHZhbHVlIHRvIGEgc3RyaW5nLlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gc2V0dGluZyBKUyBwcm9wZXJ0eSB2YWx1ZXMgdG9cbiAgICAgKiBIVE1MIGF0dHJpYnV0ZXMuICBVc2VycyBtYXkgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gcHJvdmlkZVxuICAgICAqIHNlcmlhbGl6YXRpb24gZm9yIGN1c3RvbSB0eXBlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgUHJvcGVydHkgdmFsdWUgdG8gc2VyaWFsaXplLlxuICAgICAqIEByZXR1cm4ge3N0cmluZyB8IHVuZGVmaW5lZH0gU3RyaW5nIHNlcmlhbGl6ZWQgZnJvbSB0aGUgcHJvdmlkZWRcbiAgICAgKiBwcm9wZXJ0eSAgdmFsdWUuXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX3NlcmlhbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gdmFsdWUgIT0gbnVsbCA/IHZhbHVlLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSBzdHJpbmcgdG8gYSB0eXBlZCBKYXZhU2NyaXB0IHZhbHVlLlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gcmVhZGluZyBIVE1MIGF0dHJpYnV0ZSB2YWx1ZXMgdG9cbiAgICAgKiBKUyBwcm9wZXJ0aWVzLiAgVXNlcnMgbWF5IG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIHByb3ZpZGVcbiAgICAgKiBkZXNlcmlhbGl6YXRpb24gZm9yIGN1c3RvbSBgdHlwZWBzLiBUeXBlcyBmb3IgYEJvb2xlYW5gLCBgU3RyaW5nYCxcbiAgICAgKiBhbmQgYE51bWJlcmAgY29udmVydCBhdHRyaWJ1dGVzIHRvIHRoZSBleHBlY3RlZCB0eXBlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gdmFsdWUgVmFsdWUgdG8gZGVzZXJpYWxpemUuXG4gICAgICogQHBhcmFtIHsqPX0gdHlwZSBUeXBlIHRvIGRlc2VyaWFsaXplIHRoZSBzdHJpbmcgdG8uXG4gICAgICogQHJldHVybiB7Kn0gVHlwZWQgdmFsdWUgZGVzZXJpYWxpemVkIGZyb20gdGhlIHByb3ZpZGVkIHN0cmluZy5cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfZGVzZXJpYWxpemVWYWx1ZSh2YWx1ZSwgdHlwZSkge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgQm9vbGVhbjpcbiAgICAgICAgICByZXR1cm4gKHZhbHVlICE9PSBudWxsKTtcbiAgICAgICAgY2FzZSBOdW1iZXI6XG4gICAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cbiAgcmV0dXJuIFByb3BlcnRpZXNDaGFuZ2VkO1xufSk7XG4iLCIvKipcbkBsaWNlbnNlXG5Db3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcblRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbnN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4qL1xuaW1wb3J0ICcuLi91dGlscy9ib290LmpzJztcblxuaW1wb3J0IHsgZGVkdXBpbmdNaXhpbiB9IGZyb20gJy4uL3V0aWxzL21peGluLmpzJztcbmltcG9ydCB7IFByb3BlcnRpZXNDaGFuZ2VkIH0gZnJvbSAnLi9wcm9wZXJ0aWVzLWNoYW5nZWQuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjb3B5IG9mIGBwcm9wc2Agd2l0aCBlYWNoIHByb3BlcnR5IG5vcm1hbGl6ZWQgc3VjaCB0aGF0XG4gKiB1cGdyYWRlZCBpdCBpcyBhbiBvYmplY3Qgd2l0aCBhdCBsZWFzdCBhIHR5cGUgcHJvcGVydHkgeyB0eXBlOiBUeXBlfS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcHMgUHJvcGVydGllcyB0byBub3JtYWxpemVcbiAqIEByZXR1cm4ge09iamVjdH0gQ29weSBvZiBpbnB1dCBgcHJvcHNgIHdpdGggbm9ybWFsaXplZCBwcm9wZXJ0aWVzIHRoYXRcbiAqIGFyZSBpbiB0aGUgZm9ybSB7dHlwZTogVHlwZX1cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVByb3BlcnRpZXMocHJvcHMpIHtcbiAgY29uc3Qgb3V0cHV0ID0ge307XG4gIGZvciAobGV0IHAgaW4gcHJvcHMpIHtcbiAgICBjb25zdCBvID0gcHJvcHNbcF07XG4gICAgb3V0cHV0W3BdID0gKHR5cGVvZiBvID09PSAnZnVuY3Rpb24nKSA/IHt0eXBlOiBvfSA6IG87XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuLyoqXG4gKiBNaXhpbiB0aGF0IHByb3ZpZGVzIGEgbWluaW1hbCBzdGFydGluZyBwb2ludCB0byB1c2luZyB0aGUgUHJvcGVydGllc0NoYW5nZWRcbiAqIG1peGluIGJ5IHByb3ZpZGluZyBhIG1lY2hhbmlzbSB0byBkZWNsYXJlIHByb3BlcnRpZXMgaW4gYSBzdGF0aWNcbiAqIGdldHRlciAoZS5nLiBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7IHJldHVybiB7IGZvbzogU3RyaW5nIH0gfSkuIENoYW5nZXNcbiAqIGFyZSByZXBvcnRlZCB2aWEgdGhlIGBfcHJvcGVydGllc0NoYW5nZWRgIG1ldGhvZC5cbiAqXG4gKiBUaGlzIG1peGluIHByb3ZpZGVzIG5vIHNwZWNpZmljIHN1cHBvcnQgZm9yIHJlbmRlcmluZy4gVXNlcnMgYXJlIGV4cGVjdGVkXG4gKiB0byBjcmVhdGUgYSBTaGFkb3dSb290IGFuZCBwdXQgY29udGVudCBpbnRvIGl0IGFuZCB1cGRhdGUgaXQgaW4gd2hhdGV2ZXJcbiAqIHdheSBtYWtlcyBzZW5zZS4gVGhpcyBjYW4gYmUgZG9uZSBpbiByZWFjdGlvbiB0byBwcm9wZXJ0aWVzIGNoYW5naW5nIGJ5XG4gKiBpbXBsZW1lbnRpbmcgYF9wcm9wZXJ0aWVzQ2hhbmdlZGAuXG4gKlxuICogQG1peGluRnVuY3Rpb25cbiAqIEBwb2x5bWVyXG4gKiBAYXBwbGllc01peGluIFByb3BlcnRpZXNDaGFuZ2VkXG4gKiBAc3VtbWFyeSBNaXhpbiB0aGF0IHByb3ZpZGVzIGEgbWluaW1hbCBzdGFydGluZyBwb2ludCBmb3IgdXNpbmdcbiAqIHRoZSBQcm9wZXJ0aWVzQ2hhbmdlZCBtaXhpbiBieSBwcm92aWRpbmcgYSBkZWNsYXJhdGl2ZSBgcHJvcGVydGllc2Agb2JqZWN0LlxuICovXG5leHBvcnQgY29uc3QgUHJvcGVydGllc01peGluID0gZGVkdXBpbmdNaXhpbihzdXBlckNsYXNzID0+IHtcblxuIC8qKlxuICAqIEBjb25zdHJ1Y3RvclxuICAqIEBpbXBsZW1lbnRzIHtQb2x5bWVyX1Byb3BlcnRpZXNDaGFuZ2VkfVxuICAqIEBwcml2YXRlXG4gICovXG4gY29uc3QgYmFzZSA9IFByb3BlcnRpZXNDaGFuZ2VkKHN1cGVyQ2xhc3MpO1xuXG4gLyoqXG4gICogUmV0dXJucyB0aGUgc3VwZXIgY2xhc3MgY29uc3RydWN0b3IgZm9yIHRoZSBnaXZlbiBjbGFzcywgaWYgaXQgaXMgYW5cbiAgKiBpbnN0YW5jZSBvZiB0aGUgUHJvcGVydGllc01peGluLlxuICAqXG4gICogQHBhcmFtIHshUHJvcGVydGllc01peGluQ29uc3RydWN0b3J9IGNvbnN0cnVjdG9yIFByb3BlcnRpZXNNaXhpbiBjb25zdHJ1Y3RvclxuICAqIEByZXR1cm4gez9Qcm9wZXJ0aWVzTWl4aW5Db25zdHJ1Y3Rvcn0gU3VwZXIgY2xhc3MgY29uc3RydWN0b3JcbiAgKi9cbiBmdW5jdGlvbiBzdXBlclByb3BlcnRpZXNDbGFzcyhjb25zdHJ1Y3Rvcikge1xuICAgY29uc3Qgc3VwZXJDdG9yID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNvbnN0cnVjdG9yKTtcblxuICAgLy8gTm90ZSwgdGhlIGBQcm9wZXJ0aWVzTWl4aW5gIGNsYXNzIGJlbG93IG9ubHkgcmVmZXJzIHRvIHRoZSBjbGFzc1xuICAgLy8gZ2VuZXJhdGVkIGJ5IHRoaXMgY2FsbCB0byB0aGUgbWl4aW47IHRoZSBpbnN0YW5jZW9mIHRlc3Qgb25seSB3b3Jrc1xuICAgLy8gYmVjYXVzZSB0aGUgbWl4aW4gaXMgZGVkdXBlZCBhbmQgZ3VhcmFudGVlZCBvbmx5IHRvIGFwcGx5IG9uY2UsIGhlbmNlXG4gICAvLyBhbGwgY29uc3RydWN0b3JzIGluIGEgcHJvdG8gY2hhaW4gd2lsbCBzZWUgdGhlIHNhbWUgYFByb3BlcnRpZXNNaXhpbmBcbiAgIHJldHVybiAoc3VwZXJDdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFByb3BlcnRpZXNNaXhpbikgP1xuICAgICAvKiogQHR5cGUgeyFQcm9wZXJ0aWVzTWl4aW5Db25zdHJ1Y3Rvcn0gKi8gKHN1cGVyQ3RvcikgOiBudWxsO1xuIH1cblxuIC8qKlxuICAqIFJldHVybnMgYSBtZW1vaXplZCB2ZXJzaW9uIG9mIHRoZSBgcHJvcGVydGllc2Agb2JqZWN0IGZvciB0aGVcbiAgKiBnaXZlbiBjbGFzcy4gUHJvcGVydGllcyBub3QgaW4gb2JqZWN0IGZvcm1hdCBhcmUgY29udmVydGVkIHRvIGF0XG4gICogbGVhc3Qge3R5cGV9LlxuICAqXG4gICogQHBhcmFtIHtQcm9wZXJ0aWVzTWl4aW5Db25zdHJ1Y3Rvcn0gY29uc3RydWN0b3IgUHJvcGVydGllc01peGluIGNvbnN0cnVjdG9yXG4gICogQHJldHVybiB7T2JqZWN0fSBNZW1vaXplZCBwcm9wZXJ0aWVzIG9iamVjdFxuICAqL1xuIGZ1bmN0aW9uIG93blByb3BlcnRpZXMoY29uc3RydWN0b3IpIHtcbiAgIGlmICghY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoSlNDb21waWxlcl9yZW5hbWVQcm9wZXJ0eSgnX19vd25Qcm9wZXJ0aWVzJywgY29uc3RydWN0b3IpKSkge1xuICAgICBsZXQgcHJvcHMgPSBudWxsO1xuXG4gICAgIGlmIChjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShKU0NvbXBpbGVyX3JlbmFtZVByb3BlcnR5KCdwcm9wZXJ0aWVzJywgY29uc3RydWN0b3IpKSAmJiBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzKSB7XG4gICAgICAgcHJvcHMgPSBub3JtYWxpemVQcm9wZXJ0aWVzKGNvbnN0cnVjdG9yLnByb3BlcnRpZXMpO1xuICAgICB9XG5cbiAgICAgY29uc3RydWN0b3IuX19vd25Qcm9wZXJ0aWVzID0gcHJvcHM7XG4gICB9XG4gICByZXR1cm4gY29uc3RydWN0b3IuX19vd25Qcm9wZXJ0aWVzO1xuIH1cblxuIC8qKlxuICAqIEBwb2x5bWVyXG4gICogQG1peGluQ2xhc3NcbiAgKiBAZXh0ZW5kcyB7YmFzZX1cbiAgKiBAaW1wbGVtZW50cyB7UG9seW1lcl9Qcm9wZXJ0aWVzTWl4aW59XG4gICogQHVucmVzdHJpY3RlZFxuICAqL1xuIGNsYXNzIFByb3BlcnRpZXNNaXhpbiBleHRlbmRzIGJhc2Uge1xuXG4gICAvKipcbiAgICAqIEltcGxlbWVudHMgc3RhbmRhcmQgY3VzdG9tIGVsZW1lbnRzIGdldHRlciB0byBvYnNlcnZlcyB0aGUgYXR0cmlidXRlc1xuICAgICogbGlzdGVkIGluIGBwcm9wZXJ0aWVzYC5cbiAgICAqIEBzdXBwcmVzcyB7bWlzc2luZ1Byb3BlcnRpZXN9IEludGVyZmFjZXMgaW4gY2xvc3VyZSBkbyBub3QgaW5oZXJpdCBzdGF0aWNzLCBidXQgY2xhc3NlcyBkb1xuICAgICovXG4gICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgY29uc3QgcHJvcHMgPSB0aGlzLl9wcm9wZXJ0aWVzO1xuICAgICByZXR1cm4gcHJvcHMgPyBPYmplY3Qua2V5cyhwcm9wcykubWFwKHAgPT4gdGhpcy5hdHRyaWJ1dGVOYW1lRm9yUHJvcGVydHkocCkpIDogW107XG4gICB9XG5cbiAgIC8qKlxuICAgICogRmluYWxpemVzIGFuIGVsZW1lbnQgZGVmaW5pdGlvbiwgaW5jbHVkaW5nIGVuc3VyaW5nIGFueSBzdXBlciBjbGFzc2VzXG4gICAgKiBhcmUgYWxzbyBmaW5hbGl6ZWQuIFRoaXMgaW5jbHVkZXMgZW5zdXJpbmcgcHJvcGVydHlcbiAgICAqIGFjY2Vzc29ycyBleGlzdCBvbiB0aGUgZWxlbWVudCBwcm90b3R5cGUuIFRoaXMgbWV0aG9kIGNhbGxzXG4gICAgKiBgX2ZpbmFsaXplQ2xhc3NgIHRvIGZpbmFsaXplIGVhY2ggY29uc3RydWN0b3IgaW4gdGhlIHByb3RvdHlwZSBjaGFpbi5cbiAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgKi9cbiAgIHN0YXRpYyBmaW5hbGl6ZSgpIHtcbiAgICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KEpTQ29tcGlsZXJfcmVuYW1lUHJvcGVydHkoJ19fZmluYWxpemVkJywgdGhpcykpKSB7XG4gICAgICAgY29uc3Qgc3VwZXJDdG9yID0gc3VwZXJQcm9wZXJ0aWVzQ2xhc3MoLyoqIEB0eXBlIHshUHJvcGVydGllc01peGluQ29uc3RydWN0b3J9ICovKHRoaXMpKTtcbiAgICAgICBpZiAoc3VwZXJDdG9yKSB7XG4gICAgICAgICBzdXBlckN0b3IuZmluYWxpemUoKTtcbiAgICAgICB9XG4gICAgICAgdGhpcy5fX2ZpbmFsaXplZCA9IHRydWU7XG4gICAgICAgdGhpcy5fZmluYWxpemVDbGFzcygpO1xuICAgICB9XG4gICB9XG5cbiAgIC8qKlxuICAgICogRmluYWxpemUgYW4gZWxlbWVudCBjbGFzcy4gVGhpcyBpbmNsdWRlcyBlbnN1cmluZyBwcm9wZXJ0eVxuICAgICogYWNjZXNzb3JzIGV4aXN0IG9uIHRoZSBlbGVtZW50IHByb3RvdHlwZS4gVGhpcyBtZXRob2QgaXMgY2FsbGVkIGJ5XG4gICAgKiBgZmluYWxpemVgIGFuZCBmaW5hbGl6ZXMgdGhlIGNsYXNzIGNvbnN0cnVjdG9yLlxuICAgICpcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAqL1xuICAgc3RhdGljIF9maW5hbGl6ZUNsYXNzKCkge1xuICAgICBjb25zdCBwcm9wcyA9IG93blByb3BlcnRpZXMoLyoqIEB0eXBlIHshUHJvcGVydGllc01peGluQ29uc3RydWN0b3J9ICovKHRoaXMpKTtcbiAgICAgaWYgKHByb3BzKSB7XG4gICAgICAgdGhpcy5jcmVhdGVQcm9wZXJ0aWVzKHByb3BzKTtcbiAgICAgfVxuICAgfVxuXG4gICAvKipcbiAgICAqIFJldHVybnMgYSBtZW1vaXplZCB2ZXJzaW9uIG9mIGFsbCBwcm9wZXJ0aWVzLCBpbmNsdWRpbmcgdGhvc2UgaW5oZXJpdGVkXG4gICAgKiBmcm9tIHN1cGVyIGNsYXNzZXMuIFByb3BlcnRpZXMgbm90IGluIG9iamVjdCBmb3JtYXQgYXJlIGNvbnZlcnRlZCB0b1xuICAgICogYXQgbGVhc3Qge3R5cGV9LlxuICAgICpcbiAgICAqIEByZXR1cm4ge09iamVjdH0gT2JqZWN0IGNvbnRhaW5pbmcgcHJvcGVydGllcyBmb3IgdGhpcyBjbGFzc1xuICAgICogQHByb3RlY3RlZFxuICAgICovXG4gICBzdGF0aWMgZ2V0IF9wcm9wZXJ0aWVzKCkge1xuICAgICBpZiAoIXRoaXMuaGFzT3duUHJvcGVydHkoXG4gICAgICAgSlNDb21waWxlcl9yZW5hbWVQcm9wZXJ0eSgnX19wcm9wZXJ0aWVzJywgdGhpcykpKSB7XG4gICAgICAgY29uc3Qgc3VwZXJDdG9yID0gc3VwZXJQcm9wZXJ0aWVzQ2xhc3MoLyoqIEB0eXBlIHshUHJvcGVydGllc01peGluQ29uc3RydWN0b3J9ICovKHRoaXMpKTtcbiAgICAgICB0aGlzLl9fcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sXG4gICAgICAgICBzdXBlckN0b3IgJiYgc3VwZXJDdG9yLl9wcm9wZXJ0aWVzLFxuICAgICAgICAgb3duUHJvcGVydGllcygvKiogQHR5cGUge1Byb3BlcnRpZXNNaXhpbkNvbnN0cnVjdG9yfSAqLyh0aGlzKSkpO1xuICAgICB9XG4gICAgIHJldHVybiB0aGlzLl9fcHJvcGVydGllcztcbiAgIH1cblxuICAgLyoqXG4gICAgKiBPdmVycmlkZXMgYFByb3BlcnRpZXNDaGFuZ2VkYCBtZXRob2QgdG8gcmV0dXJuIHR5cGUgc3BlY2lmaWVkIGluIHRoZVxuICAgICogc3RhdGljIGBwcm9wZXJ0aWVzYCBvYmplY3QgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eS5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE5hbWUgb2YgcHJvcGVydHlcbiAgICAqIEByZXR1cm4geyp9IFR5cGUgdG8gd2hpY2ggdG8gZGVzZXJpYWxpemUgYXR0cmlidXRlXG4gICAgKlxuICAgICogQHByb3RlY3RlZFxuICAgICovXG4gICBzdGF0aWMgdHlwZUZvclByb3BlcnR5KG5hbWUpIHtcbiAgICAgY29uc3QgaW5mbyA9IHRoaXMuX3Byb3BlcnRpZXNbbmFtZV07XG4gICAgIHJldHVybiBpbmZvICYmIGluZm8udHlwZTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBPdmVycmlkZXMgYFByb3BlcnRpZXNDaGFuZ2VkYCBtZXRob2QgYW5kIGFkZHMgYSBjYWxsIHRvXG4gICAgKiBgZmluYWxpemVgIHdoaWNoIGxhemlseSBjb25maWd1cmVzIHRoZSBlbGVtZW50J3MgcHJvcGVydHkgYWNjZXNzb3JzLlxuICAgICogQG92ZXJyaWRlXG4gICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICovXG4gICBfaW5pdGlhbGl6ZVByb3BlcnRpZXMoKSB7XG4gICAgIHRoaXMuY29uc3RydWN0b3IuZmluYWxpemUoKTtcbiAgICAgc3VwZXIuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gdGhlIGVsZW1lbnQgaXMgYWRkZWQgdG8gYSBkb2N1bWVudC5cbiAgICAqIENhbGxzIGBfZW5hYmxlUHJvcGVydGllc2AgdG8gdHVybiBvbiBwcm9wZXJ0eSBzeXN0ZW0gZnJvbVxuICAgICogYFByb3BlcnRpZXNDaGFuZ2VkYC5cbiAgICAqIEBzdXBwcmVzcyB7bWlzc2luZ1Byb3BlcnRpZXN9IFN1cGVyIG1heSBvciBtYXkgbm90IGltcGxlbWVudCB0aGUgY2FsbGJhY2tcbiAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgKiBAb3ZlcnJpZGVcbiAgICAqL1xuICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgIGlmIChzdXBlci5jb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgIH1cbiAgICAgdGhpcy5fZW5hYmxlUHJvcGVydGllcygpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENhbGxlZCB3aGVuIHRoZSBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSBhIGRvY3VtZW50XG4gICAgKiBAc3VwcHJlc3Mge21pc3NpbmdQcm9wZXJ0aWVzfSBTdXBlciBtYXkgb3IgbWF5IG5vdCBpbXBsZW1lbnQgdGhlIGNhbGxiYWNrXG4gICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICogQG92ZXJyaWRlXG4gICAgKi9cbiAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICBpZiAoc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgICBzdXBlci5kaXNjb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICB9XG4gICB9XG5cbiB9XG5cbiByZXR1cm4gUHJvcGVydGllc01peGluO1xuXG59KTtcbiIsIi8qKlxuQGxpY2Vuc2VcbkNvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5UaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG5UaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG5Db2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiovXG5pbXBvcnQgJy4vYm9vdC5qcyc7XG5cbmNvbnN0IGNhc2VNYXAgPSB7fTtcbmNvbnN0IERBU0hfVE9fQ0FNRUwgPSAvLVthLXpdL2c7XG5jb25zdCBDQU1FTF9UT19EQVNIID0gLyhbQS1aXSkvZztcblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IE1vZHVsZSB3aXRoIHV0aWxpdGllcyBmb3IgY29udmVydGluZyBiZXR3ZWVuIFwiZGFzaC1jYXNlXCIgYW5kXG4gKiBcImNhbWVsQ2FzZVwiIGlkZW50aWZpZXJzLlxuICovXG5cbi8qKlxuICogQ29udmVydHMgXCJkYXNoLWNhc2VcIiBpZGVudGlmaWVyIChlLmcuIGBmb28tYmFyLWJhemApIHRvIFwiY2FtZWxDYXNlXCJcbiAqIChlLmcuIGBmb29CYXJCYXpgKS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGFzaCBEYXNoLWNhc2UgaWRlbnRpZmllclxuICogQHJldHVybiB7c3RyaW5nfSBDYW1lbC1jYXNlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBpZGVudGlmaWVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXNoVG9DYW1lbENhc2UoZGFzaCkge1xuICByZXR1cm4gY2FzZU1hcFtkYXNoXSB8fCAoXG4gICAgY2FzZU1hcFtkYXNoXSA9IGRhc2guaW5kZXhPZignLScpIDwgMCA/IGRhc2ggOiBkYXNoLnJlcGxhY2UoREFTSF9UT19DQU1FTCxcbiAgICAgIChtKSA9PiBtWzFdLnRvVXBwZXJDYXNlKClcbiAgICApXG4gICk7XG59XG5cbi8qKlxuICogQ29udmVydHMgXCJjYW1lbENhc2VcIiBpZGVudGlmaWVyIChlLmcuIGBmb29CYXJCYXpgKSB0byBcImRhc2gtY2FzZVwiXG4gKiAoZS5nLiBgZm9vLWJhci1iYXpgKS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY2FtZWwgQ2FtZWwtY2FzZSBpZGVudGlmaWVyXG4gKiBAcmV0dXJuIHtzdHJpbmd9IERhc2gtY2FzZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgaWRlbnRpZmllclxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxUb0Rhc2hDYXNlKGNhbWVsKSB7XG4gIHJldHVybiBjYXNlTWFwW2NhbWVsXSB8fCAoXG4gICAgY2FzZU1hcFtjYW1lbF0gPSBjYW1lbC5yZXBsYWNlKENBTUVMX1RPX0RBU0gsICctJDEnKS50b0xvd2VyQ2FzZSgpXG4gICk7XG59XG4iLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vLyBUaGUgZmlyc3QgYXJndW1lbnQgdG8gSlMgdGVtcGxhdGUgdGFncyByZXRhaW4gaWRlbnRpdHkgYWNyb3NzIG11bHRpcGxlXG4vLyBjYWxscyB0byBhIHRhZyBmb3IgdGhlIHNhbWUgbGl0ZXJhbCwgc28gd2UgY2FuIGNhY2hlIHdvcmsgZG9uZSBwZXIgbGl0ZXJhbFxuLy8gaW4gYSBNYXAuXG5leHBvcnQgY29uc3QgdGVtcGxhdGVDYWNoZXMgPSBuZXcgTWFwKCk7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdodG1sJyk7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIFNWRyB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBzdmcgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgU1ZHVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnc3ZnJyk7XG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiBgaHRtbGAsIHdoaWNoIGhvbGRzIGEgVGVtcGxhdGUgYW5kIHRoZSB2YWx1ZXMgZnJvbVxuICogaW50ZXJwb2xhdGVkIGV4cHJlc3Npb25zLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0cmluZ3MsIHZhbHVlcywgdHlwZSwgcGFydENhbGxiYWNrID0gZGVmYXVsdFBhcnRDYWxsYmFjaykge1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5wYXJ0Q2FsbGJhY2sgPSBwYXJ0Q2FsbGJhY2s7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgSFRNTCB1c2VkIHRvIGNyZWF0ZSBhIDx0ZW1wbGF0ZT4gZWxlbWVudC5cbiAgICAgKi9cbiAgICBnZXRIVE1MKCkge1xuICAgICAgICBjb25zdCBsID0gdGhpcy5zdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIGxldCBpc1RleHRCaW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnN0cmluZ3NbaV07XG4gICAgICAgICAgICBodG1sICs9IHM7XG4gICAgICAgICAgICAvLyBXZSdyZSBpbiBhIHRleHQgcG9zaXRpb24gaWYgdGhlIHByZXZpb3VzIHN0cmluZyBjbG9zZWQgaXRzIHRhZ3MuXG4gICAgICAgICAgICAvLyBJZiBpdCBkb2Vzbid0IGhhdmUgYW55IHRhZ3MsIHRoZW4gd2UgdXNlIHRoZSBwcmV2aW91cyB0ZXh0IHBvc2l0aW9uXG4gICAgICAgICAgICAvLyBzdGF0ZS5cbiAgICAgICAgICAgIGNvbnN0IGNsb3NpbmcgPSBmaW5kVGFnQ2xvc2Uocyk7XG4gICAgICAgICAgICBpc1RleHRCaW5kaW5nID0gY2xvc2luZyA+IC0xID8gY2xvc2luZyA8IHMubGVuZ3RoIDogaXNUZXh0QmluZGluZztcbiAgICAgICAgICAgIGh0bWwgKz0gaXNUZXh0QmluZGluZyA/IG5vZGVNYXJrZXIgOiBtYXJrZXI7XG4gICAgICAgIH1cbiAgICAgICAgaHRtbCArPSB0aGlzLnN0cmluZ3NbbF07XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGhpcy5nZXRIVE1MKCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vKipcbiAqIEEgVGVtcGxhdGVSZXN1bHQgZm9yIFNWRyBmcmFnbWVudHMuXG4gKlxuICogVGhpcyBjbGFzcyB3cmFwcyBIVE1sIGluIGFuIDxzdmc+IHRhZyBpbiBvcmRlciB0byBwYXJzZSBpdHMgY29udGVudHMgaW4gdGhlXG4gKiBTVkcgbmFtZXNwYWNlLCB0aGVuIG1vZGlmaWVzIHRoZSB0ZW1wbGF0ZSB0byByZW1vdmUgdGhlIDxzdmc+IHRhZyBzbyB0aGF0XG4gKiBjbG9uZXMgb25seSBjb250YWluZXIgdGhlIG9yaWdpbmFsIGZyYWdtZW50LlxuICovXG5leHBvcnQgY2xhc3MgU1ZHVGVtcGxhdGVSZXN1bHQgZXh0ZW5kcyBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgZ2V0SFRNTCgpIHtcbiAgICAgICAgcmV0dXJuIGA8c3ZnPiR7c3VwZXIuZ2V0SFRNTCgpfTwvc3ZnPmA7XG4gICAgfVxuICAgIGdldFRlbXBsYXRlRWxlbWVudCgpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBzdXBlci5nZXRUZW1wbGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSBjb250ZW50LmZpcnN0Q2hpbGQ7XG4gICAgICAgIGNvbnRlbnQucmVtb3ZlQ2hpbGQoc3ZnRWxlbWVudCk7XG4gICAgICAgIHJlcGFyZW50Tm9kZXMoY29udGVudCwgc3ZnRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbn1cbi8qKlxuICogVGhlIGRlZmF1bHQgVGVtcGxhdGVGYWN0b3J5IHdoaWNoIGNhY2hlcyBUZW1wbGF0ZXMga2V5ZWQgb25cbiAqIHJlc3VsdC50eXBlIGFuZCByZXN1bHQuc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRUZW1wbGF0ZUZhY3RvcnkocmVzdWx0KSB7XG4gICAgbGV0IHRlbXBsYXRlQ2FjaGUgPSB0ZW1wbGF0ZUNhY2hlcy5nZXQocmVzdWx0LnR5cGUpO1xuICAgIGlmICh0ZW1wbGF0ZUNhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGVtcGxhdGVDYWNoZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGVtcGxhdGVDYWNoZXMuc2V0KHJlc3VsdC50eXBlLCB0ZW1wbGF0ZUNhY2hlKTtcbiAgICB9XG4gICAgbGV0IHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHJlc3VsdCwgcmVzdWx0LmdldFRlbXBsYXRlRWxlbWVudCgpKTtcbiAgICAgICAgdGVtcGxhdGVDYWNoZS5zZXQocmVzdWx0LnN0cmluZ3MsIHRlbXBsYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xufVxuLyoqXG4gKiBSZW5kZXJzIGEgdGVtcGxhdGUgdG8gYSBjb250YWluZXIuXG4gKlxuICogVG8gdXBkYXRlIGEgY29udGFpbmVyIHdpdGggbmV3IHZhbHVlcywgcmVldmFsdWF0ZSB0aGUgdGVtcGxhdGUgbGl0ZXJhbCBhbmRcbiAqIGNhbGwgYHJlbmRlcmAgd2l0aCB0aGUgbmV3IHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0gcmVzdWx0IGEgVGVtcGxhdGVSZXN1bHQgY3JlYXRlZCBieSBldmFsdWF0aW5nIGEgdGVtcGxhdGUgdGFnIGxpa2VcbiAqICAgICBgaHRtbGAgb3IgYHN2Z2AuXG4gKiBAcGFyYW0gY29udGFpbmVyIEEgRE9NIHBhcmVudCB0byByZW5kZXIgdG8uIFRoZSBlbnRpcmUgY29udGVudHMgYXJlIGVpdGhlclxuICogICAgIHJlcGxhY2VkLCBvciBlZmZpY2llbnRseSB1cGRhdGVkIGlmIHRoZSBzYW1lIHJlc3VsdCB0eXBlIHdhcyBwcmV2aW91c1xuICogICAgIHJlbmRlcmVkIHRoZXJlLlxuICogQHBhcmFtIHRlbXBsYXRlRmFjdG9yeSBhIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFRlbXBsYXRlIG9yIHJldHJlaXZlIG9uZSBmcm9tXG4gKiAgICAgY2FjaGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIocmVzdWx0LCBjb250YWluZXIsIHRlbXBsYXRlRmFjdG9yeSA9IGRlZmF1bHRUZW1wbGF0ZUZhY3RvcnkpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRlbXBsYXRlRmFjdG9yeShyZXN1bHQpO1xuICAgIGxldCBpbnN0YW5jZSA9IGNvbnRhaW5lci5fX3RlbXBsYXRlSW5zdGFuY2U7XG4gICAgLy8gUmVwZWF0IHJlbmRlciwganVzdCBjYWxsIHVwZGF0ZSgpXG4gICAgaWYgKGluc3RhbmNlICE9PSB1bmRlZmluZWQgJiYgaW5zdGFuY2UudGVtcGxhdGUgPT09IHRlbXBsYXRlICYmXG4gICAgICAgIGluc3RhbmNlLl9wYXJ0Q2FsbGJhY2sgPT09IHJlc3VsdC5wYXJ0Q2FsbGJhY2spIHtcbiAgICAgICAgaW5zdGFuY2UudXBkYXRlKHJlc3VsdC52YWx1ZXMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIEZpcnN0IHJlbmRlciwgY3JlYXRlIGEgbmV3IFRlbXBsYXRlSW5zdGFuY2UgYW5kIGFwcGVuZCBpdFxuICAgIGluc3RhbmNlID1cbiAgICAgICAgbmV3IFRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUsIHJlc3VsdC5wYXJ0Q2FsbGJhY2ssIHRlbXBsYXRlRmFjdG9yeSk7XG4gICAgY29udGFpbmVyLl9fdGVtcGxhdGVJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKCk7XG4gICAgaW5zdGFuY2UudXBkYXRlKHJlc3VsdC52YWx1ZXMpO1xuICAgIHJlbW92ZU5vZGVzKGNvbnRhaW5lciwgY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG59XG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHdpdGggZW1iZWRkZWQgdW5pcXVlIGtleSB0byBhdm9pZCBjb2xsaXNpb24gd2l0aFxuICogcG9zc2libGUgdGV4dCBpbiB0ZW1wbGF0ZXMuXG4gKi9cbmNvbnN0IG1hcmtlciA9IGB7e2xpdC0ke1N0cmluZyhNYXRoLnJhbmRvbSgpKS5zbGljZSgyKX19fWA7XG4vKipcbiAqIEFuIGV4cHJlc3Npb24gbWFya2VyIHVzZWQgdGV4dC1wb3NpdGlvbnMsIG5vdCBhdHRyaWJ1dGUgcG9zaXRpb25zLFxuICogaW4gdGVtcGxhdGUuXG4gKi9cbmNvbnN0IG5vZGVNYXJrZXIgPSBgPCEtLSR7bWFya2VyfS0tPmA7XG5jb25zdCBtYXJrZXJSZWdleCA9IG5ldyBSZWdFeHAoYCR7bWFya2VyfXwke25vZGVNYXJrZXJ9YCk7XG4vKipcbiAqIFRoaXMgcmVnZXggZXh0cmFjdHMgdGhlIGF0dHJpYnV0ZSBuYW1lIHByZWNlZGluZyBhbiBhdHRyaWJ1dGUtcG9zaXRpb25cbiAqIGV4cHJlc3Npb24uIEl0IGRvZXMgdGhpcyBieSBtYXRjaGluZyB0aGUgc3ludGF4IGFsbG93ZWQgZm9yIGF0dHJpYnV0ZXNcbiAqIGFnYWluc3QgdGhlIHN0cmluZyBsaXRlcmFsIGRpcmVjdGx5IHByZWNlZGluZyB0aGUgZXhwcmVzc2lvbiwgYXNzdW1pbmcgdGhhdFxuICogdGhlIGV4cHJlc3Npb24gaXMgaW4gYW4gYXR0cmlidXRlLXZhbHVlIHBvc2l0aW9uLlxuICpcbiAqIFNlZSBhdHRyaWJ1dGVzIGluIHRoZSBIVE1MIHNwZWM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvc3ludGF4Lmh0bWwjYXR0cmlidXRlcy0wXG4gKlxuICogXCJcXDAtXFx4MUZcXHg3Ri1cXHg5RlwiIGFyZSBVbmljb2RlIGNvbnRyb2wgY2hhcmFjdGVyc1xuICpcbiAqIFwiIFxceDA5XFx4MGFcXHgwY1xceDBkXCIgYXJlIEhUTUwgc3BhY2UgY2hhcmFjdGVyczpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9pbmZyYXN0cnVjdHVyZS5odG1sI3NwYWNlLWNoYXJhY3RlclxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIGNvbnRyb2wgY2hhcmFjdGVyLCBzcGFjZSBjaGFyYWN0ZXIsICgnKSxcbiAqICAgIChcIiksIFwiPlwiLCBcIj1cIiwgb3IgXCIvXCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieSBcIj1cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5OlxuICogICAgKiBBbnkgY2hhcmFjdGVyIGV4Y2VwdCBzcGFjZSwgKCcpLCAoXCIpLCBcIjxcIiwgXCI+XCIsIFwiPVwiLCAoYCksIG9yXG4gKiAgICAqIChcIikgdGhlbiBhbnkgbm9uLShcIiksIG9yXG4gKiAgICAqICgnKSB0aGVuIGFueSBub24tKCcpXG4gKi9cbmNvbnN0IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXggPSAvWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0oW15cXDAtXFx4MUZcXHg3Ri1cXHg5RiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiJz49L10rKVsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKj1bIFxceDA5XFx4MGFcXHgwY1xceDBkXSooPzpbXiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiJ2A8Pj1dKnxcIlteXCJdKnwnW14nXSopJC87XG4vKipcbiAqIEZpbmRzIHRoZSBjbG9zaW5nIGluZGV4IG9mIHRoZSBsYXN0IGNsb3NlZCBIVE1MIHRhZy5cbiAqIFRoaXMgaGFzIDMgcG9zc2libGUgcmV0dXJuIHZhbHVlczpcbiAqICAgLSBgLTFgLCBtZWFuaW5nIHRoZXJlIGlzIG5vIHRhZyBpbiBzdHIuXG4gKiAgIC0gYHN0cmluZy5sZW5ndGhgLCBtZWFuaW5nIHRoZSBsYXN0IG9wZW5lZCB0YWcgaXMgdW5jbG9zZWQuXG4gKiAgIC0gU29tZSBwb3NpdGl2ZSBudW1iZXIgPCBzdHIubGVuZ3RoLCBtZWFuaW5nIHRoZSBpbmRleCBvZiB0aGUgY2xvc2luZyAnPicuXG4gKi9cbmZ1bmN0aW9uIGZpbmRUYWdDbG9zZShzdHIpIHtcbiAgICBjb25zdCBjbG9zZSA9IHN0ci5sYXN0SW5kZXhPZignPicpO1xuICAgIGNvbnN0IG9wZW4gPSBzdHIuaW5kZXhPZignPCcsIGNsb3NlICsgMSk7XG4gICAgcmV0dXJuIG9wZW4gPiAtMSA/IHN0ci5sZW5ndGggOiBjbG9zZTtcbn1cbi8qKlxuICogQSBwbGFjZWhvbGRlciBmb3IgYSBkeW5hbWljIGV4cHJlc3Npb24gaW4gYW4gSFRNTCB0ZW1wbGF0ZS5cbiAqXG4gKiBUaGVyZSBhcmUgdHdvIGJ1aWx0LWluIHBhcnQgdHlwZXM6IEF0dHJpYnV0ZVBhcnQgYW5kIE5vZGVQYXJ0LiBOb2RlUGFydHNcbiAqIGFsd2F5cyByZXByZXNlbnQgYSBzaW5nbGUgZHluYW1pYyBleHByZXNzaW9uLCB3aGlsZSBBdHRyaWJ1dGVQYXJ0cyBtYXlcbiAqIHJlcHJlc2VudCBhcyBtYW55IGV4cHJlc3Npb25zIGFyZSBjb250YWluZWQgaW4gdGhlIGF0dHJpYnV0ZS5cbiAqXG4gKiBBIFRlbXBsYXRlJ3MgcGFydHMgYXJlIG11dGFibGUsIHNvIHBhcnRzIGNhbiBiZSByZXBsYWNlZCBvciBtb2RpZmllZFxuICogKHBvc3NpYmx5IHRvIGltcGxlbWVudCBkaWZmZXJlbnQgdGVtcGxhdGUgc2VtYW50aWNzKS4gVGhlIGNvbnRyYWN0IGlzIHRoYXRcbiAqIHBhcnRzIGNhbiBvbmx5IGJlIHJlcGxhY2VkLCBub3QgcmVtb3ZlZCwgYWRkZWQgb3IgcmVvcmRlcmVkLCBhbmQgcGFydHMgbXVzdFxuICogYWx3YXlzIGNvbnN1bWUgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIHZhbHVlcyBpbiB0aGVpciBgdXBkYXRlKClgIG1ldGhvZC5cbiAqXG4gKiBUT0RPKGp1c3RpbmZhZ25hbmkpOiBUaGF0IHJlcXVpcmVtZW50IGlzIGEgbGl0dGxlIGZyYWdpbGUuIEFcbiAqIFRlbXBsYXRlSW5zdGFuY2UgY291bGQgaW5zdGVhZCBiZSBtb3JlIGNhcmVmdWwgYWJvdXQgd2hpY2ggdmFsdWVzIGl0IGdpdmVzXG4gKiB0byBQYXJ0LnVwZGF0ZSgpLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcih0eXBlLCBpbmRleCwgbmFtZSwgcmF3TmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMucmF3TmFtZSA9IHJhd05hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVQYXJ0QWN0aXZlID0gKHBhcnQpID0+IHBhcnQuaW5kZXggIT09IC0xO1xuLyoqXG4gKiBBbiB1cGRhdGVhYmxlIFRlbXBsYXRlIHRoYXQgdHJhY2tzIHRoZSBsb2NhdGlvbiBvZiBkeW5hbWljIHBhcnRzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgZWxlbWVudCkge1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmVsZW1lbnQuY29udGVudDtcbiAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZSBudWxsXG4gICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoY29udGVudCwgMTMzIC8qIE5vZGVGaWx0ZXIuU0hPV19FTEVNRU5UIHwgTm9kZUZpbHRlci5TSE9XX0NPTU1FTlQgfFxuICAgICAgICAgICAgICAgTm9kZUZpbHRlci5TSE9XX1RFWFQgKi8sIG51bGwsIGZhbHNlKTtcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBjb25zdCBub2Rlc1RvUmVtb3ZlID0gW107XG4gICAgICAgIC8vIFRoZSBhY3R1YWwgcHJldmlvdXMgbm9kZSwgYWNjb3VudGluZyBmb3IgcmVtb3ZhbHM6IGlmIGEgbm9kZSBpcyByZW1vdmVkXG4gICAgICAgIC8vIGl0IHdpbGwgbmV2ZXIgYmUgdGhlIHByZXZpb3VzTm9kZS5cbiAgICAgICAgbGV0IHByZXZpb3VzTm9kZTtcbiAgICAgICAgLy8gVXNlZCB0byBzZXQgcHJldmlvdXNOb2RlIGF0IHRoZSB0b3Agb2YgdGhlIGxvb3AuXG4gICAgICAgIGxldCBjdXJyZW50Tm9kZTtcbiAgICAgICAgd2hpbGUgKHdhbGtlci5uZXh0Tm9kZSgpKSB7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgcHJldmlvdXNOb2RlID0gY3VycmVudE5vZGU7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gY3VycmVudE5vZGUgPSB3YWxrZXIuY3VycmVudE5vZGU7XG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSAvKiBOb2RlLkVMRU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgIGlmICghbm9kZS5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBub2RlLmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgICAgLy8gUGVyIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9OYW1lZE5vZGVNYXAsXG4gICAgICAgICAgICAgICAgLy8gYXR0cmlidXRlcyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgcmV0dXJuZWQgaW4gZG9jdW1lbnQgb3JkZXIuIEluXG4gICAgICAgICAgICAgICAgLy8gcGFydGljdWxhciwgRWRnZS9JRSBjYW4gcmV0dXJuIHRoZW0gb3V0IG9mIG9yZGVyLCBzbyB3ZSBjYW5ub3QgYXNzdW1lXG4gICAgICAgICAgICAgICAgLy8gYSBjb3JyZXNwb25kYW5jZSBiZXR3ZWVuIHBhcnQgaW5kZXggYW5kIGF0dHJpYnV0ZSBpbmRleC5cbiAgICAgICAgICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1tpXS52YWx1ZS5pbmRleE9mKG1hcmtlcikgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQtLSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSB0ZW1wbGF0ZSBsaXRlcmFsIHNlY3Rpb24gbGVhZGluZyB1cCB0byB0aGUgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgLy8gZXhwcmVzc2lvbiBpbiB0aGlzIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdGb3JQYXJ0ID0gcmVzdWx0LnN0cmluZ3NbcGFydEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgYXR0cmlidXRlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZUluUGFydCA9IGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXguZXhlYyhzdHJpbmdGb3JQYXJ0KVsxXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgY29ycmVzcG9uZGluZyBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogcmVtb3ZlIG5vbi1udWxsIGFzc2VydGlvblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzLmdldE5hbWVkSXRlbShhdHRyaWJ1dGVOYW1lSW5QYXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5nc0ZvckF0dHJpYnV0ZVZhbHVlID0gYXR0cmlidXRlLnZhbHVlLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKG5ldyBUZW1wbGF0ZVBhcnQoJ2F0dHJpYnV0ZScsIGluZGV4LCBhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlTmFtZUluUGFydCwgc3RyaW5nc0ZvckF0dHJpYnV0ZVZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4ICs9IHN0cmluZ3NGb3JBdHRyaWJ1dGVWYWx1ZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlVmFsdWUgPSBub2RlLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZVZhbHVlLmluZGV4T2YobWFya2VyKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdzID0gbm9kZVZhbHVlLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHBhcnQgZm9yIGVhY2ggbWF0Y2ggZm91bmRcbiAgICAgICAgICAgICAgICBwYXJ0SW5kZXggKz0gbGFzdEluZGV4O1xuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHRleHQgbm9kZSBmb3IgZWFjaCBsaXRlcmFsIHNlY3Rpb25cbiAgICAgICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SW5kZXg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKChzdHJpbmdzW2ldID09PSAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RyaW5nc1tpXSksIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2gobmV3IFRlbXBsYXRlUGFydCgnbm9kZScsIGluZGV4KyspKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShzdHJpbmdzW2xhc3RJbmRleF0gPT09ICcnID9cbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJykgOlxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHJpbmdzW2xhc3RJbmRleF0pLCBub2RlKTtcbiAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSA4IC8qIE5vZGUuQ09NTUVOVF9OT0RFICovICYmXG4gICAgICAgICAgICAgICAgbm9kZS5ub2RlVmFsdWUgPT09IG1hcmtlcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAvLyBBZGQgYSBuZXcgbWFya2VyIG5vZGUgdG8gYmUgdGhlIHN0YXJ0Tm9kZSBvZiB0aGUgUGFydCBpZiBhbnkgb2YgdGhlXG4gICAgICAgICAgICAgICAgLy8gZm9sbG93aW5nIGFyZSB0cnVlOlxuICAgICAgICAgICAgICAgIC8vICAqIFdlIGRvbid0IGhhdmUgYSBwcmV2aW91c1NpYmxpbmdcbiAgICAgICAgICAgICAgICAvLyAgKiBwcmV2aW91c1NpYmxpbmcgaXMgYmVpbmcgcmVtb3ZlZCAodGh1cyBpdCdzIG5vdCB0aGVcbiAgICAgICAgICAgICAgICAvLyAgICBgcHJldmlvdXNOb2RlYClcbiAgICAgICAgICAgICAgICAvLyAgKiBwcmV2aW91c1NpYmxpbmcgaXMgbm90IGEgVGV4dCBub2RlXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBXZSBzaG91bGQgYmUgYWJsZSB0byB1c2UgdGhlIHByZXZpb3VzTm9kZSBoZXJlXG4gICAgICAgICAgICAgICAgLy8gYXMgdGhlIG1hcmtlciBub2RlIGFuZCByZWR1Y2UgdGhlIG51bWJlciBvZiBleHRyYSBub2RlcyB3ZSBhZGQgdG8gYVxuICAgICAgICAgICAgICAgIC8vIHRlbXBsYXRlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL1BvbHltZXJMYWJzL2xpdC1odG1sL2lzc3Vlcy8xNDdcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c1NpYmxpbmcgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNTaWJsaW5nID09PSBudWxsIHx8IHByZXZpb3VzU2libGluZyAhPT0gcHJldmlvdXNOb2RlIHx8XG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzU2libGluZy5ub2RlVHlwZSAhPT0gTm9kZS5URVhUX05PREUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2gobmV3IFRlbXBsYXRlUGFydCgnbm9kZScsIGluZGV4KyspKTtcbiAgICAgICAgICAgICAgICBub2Rlc1RvUmVtb3ZlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIG5leHRTaWJsaW5nIGFkZCBhIG1hcmtlciBub2RlLlxuICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IGhhdmUgdG8gY2hlY2sgaWYgdGhlIG5leHQgbm9kZSBpcyBnb2luZyB0byBiZSByZW1vdmVkLFxuICAgICAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhhdCBub2RlIHdpbGwgaW5kdWNlIGEgbmV3IG1hcmtlciBpZiBzby5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5uZXh0U2libGluZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpLCBub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlID0gcHJldmlvdXNOb2RlO1xuICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlbW92ZSB0ZXh0IGJpbmRpbmcgbm9kZXMgYWZ0ZXIgdGhlIHdhbGsgdG8gbm90IGRpc3R1cmIgdGhlIFRyZWVXYWxrZXJcbiAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGVzVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogUmV0dXJucyBhIHZhbHVlIHJlYWR5IHRvIGJlIGluc2VydGVkIGludG8gYSBQYXJ0IGZyb20gYSB1c2VyLXByb3ZpZGVkIHZhbHVlLlxuICpcbiAqIElmIHRoZSB1c2VyIHZhbHVlIGlzIGEgZGlyZWN0aXZlLCB0aGlzIGludm9rZXMgdGhlIGRpcmVjdGl2ZSB3aXRoIHRoZSBnaXZlblxuICogcGFydC4gSWYgdGhlIHZhbHVlIGlzIG51bGwsIGl0J3MgY29udmVydGVkIHRvIHVuZGVmaW5lZCB0byB3b3JrIGJldHRlclxuICogd2l0aCBjZXJ0YWluIERPTSBBUElzLCBsaWtlIHRleHRDb250ZW50LlxuICovXG5leHBvcnQgY29uc3QgZ2V0VmFsdWUgPSAocGFydCwgdmFsdWUpID0+IHtcbiAgICAvLyBgbnVsbGAgYXMgdGhlIHZhbHVlIG9mIGEgVGV4dCBub2RlIHdpbGwgcmVuZGVyIHRoZSBzdHJpbmcgJ251bGwnXG4gICAgLy8gc28gd2UgY29udmVydCBpdCB0byB1bmRlZmluZWRcbiAgICBpZiAoaXNEaXJlY3RpdmUodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUocGFydCk7XG4gICAgICAgIHJldHVybiBub0NoYW5nZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlID09PSBudWxsID8gdW5kZWZpbmVkIDogdmFsdWU7XG59O1xuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9IChmKSA9PiB7XG4gICAgZi5fX2xpdERpcmVjdGl2ZSA9IHRydWU7XG4gICAgcmV0dXJuIGY7XG59O1xuY29uc3QgaXNEaXJlY3RpdmUgPSAobykgPT4gdHlwZW9mIG8gPT09ICdmdW5jdGlvbicgJiYgby5fX2xpdERpcmVjdGl2ZSA9PT0gdHJ1ZTtcbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgdGhhdCBhIHZhbHVlIHdhcyBoYW5kbGVkIGJ5IGEgZGlyZWN0aXZlIGFuZFxuICogc2hvdWxkIG5vdCBiZSB3cml0dGVuIHRvIHRoZSBET00uXG4gKi9cbmV4cG9ydCBjb25zdCBub0NoYW5nZSA9IHt9O1xuLyoqXG4gKiBAZGVwcmVjYXRlZCBVc2UgYG5vQ2hhbmdlYCBpbnN0ZWFkLlxuICovXG5leHBvcnQgeyBub0NoYW5nZSBhcyBkaXJlY3RpdmVWYWx1ZSB9O1xuY29uc3QgaXNQcmltaXRpdmVWYWx1ZSA9ICh2YWx1ZSkgPT4gdmFsdWUgPT09IG51bGwgfHxcbiAgICAhKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKTtcbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihpbnN0YW5jZSwgZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgdGhpcy5fcHJldmlvdXNWYWx1ZXMgPSBbXTtcbiAgICB9XG4gICAgX2ludGVycG9sYXRlKHZhbHVlcywgc3RhcnRJbmRleCkge1xuICAgICAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuICAgICAgICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgdGV4dCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGV4dCArPSBzdHJpbmdzW2ldO1xuICAgICAgICAgICAgY29uc3QgdiA9IGdldFZhbHVlKHRoaXMsIHZhbHVlc1tzdGFydEluZGV4ICsgaV0pO1xuICAgICAgICAgICAgaWYgKHYgJiYgdiAhPT0gbm9DaGFuZ2UgJiZcbiAgICAgICAgICAgICAgICAoQXJyYXkuaXNBcnJheSh2KSB8fCB0eXBlb2YgdiAhPT0gJ3N0cmluZycgJiYgdltTeW1ib2wuaXRlcmF0b3JdKSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdCBvZiB2KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IHdlIG5lZWQgdG8gcmVjdXJzaXZlbHkgY2FsbCBnZXRWYWx1ZSBpbnRvIGl0ZXJhYmxlcy4uLlxuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCArPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0ICsgc3RyaW5nc1tsXTtcbiAgICB9XG4gICAgX2VxdWFsVG9QcmV2aW91c1ZhbHVlcyh2YWx1ZXMsIHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPCBzdGFydEluZGV4ICsgdGhpcy5zaXplOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9wcmV2aW91c1ZhbHVlc1tpXSAhPT0gdmFsdWVzW2ldIHx8XG4gICAgICAgICAgICAgICAgIWlzUHJpbWl0aXZlVmFsdWUodmFsdWVzW2ldKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgc2V0VmFsdWUodmFsdWVzLCBzdGFydEluZGV4KSB7XG4gICAgICAgIGlmICh0aGlzLl9lcXVhbFRvUHJldmlvdXNWYWx1ZXModmFsdWVzLCBzdGFydEluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHMgPSB0aGlzLnN0cmluZ3M7XG4gICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgaWYgKHMubGVuZ3RoID09PSAyICYmIHNbMF0gPT09ICcnICYmIHNbMV0gPT09ICcnKSB7XG4gICAgICAgICAgICAvLyBBbiBleHByZXNzaW9uIHRoYXQgb2NjdXBpZXMgdGhlIHdob2xlIGF0dHJpYnV0ZSB2YWx1ZSB3aWxsIGxlYXZlXG4gICAgICAgICAgICAvLyBsZWFkaW5nIGFuZCB0cmFpbGluZyBlbXB0eSBzdHJpbmdzLlxuICAgICAgICAgICAgdmFsdWUgPSBnZXRWYWx1ZSh0aGlzLCB2YWx1ZXNbc3RhcnRJbmRleF0pO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5qb2luKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5faW50ZXJwb2xhdGUodmFsdWVzLCBzdGFydEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgIT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3ByZXZpb3VzVmFsdWVzID0gdmFsdWVzO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBOb2RlUGFydCB7XG4gICAgY29uc3RydWN0b3IoaW5zdGFuY2UsIHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xuICAgICAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgICAgIHRoaXMuc3RhcnROb2RlID0gc3RhcnROb2RlO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSBlbmROb2RlO1xuICAgICAgICB0aGlzLl9wcmV2aW91c1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IGdldFZhbHVlKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1ByaW1pdGl2ZVZhbHVlKHZhbHVlKSkge1xuICAgICAgICAgICAgLy8gSGFuZGxlIHByaW1pdGl2ZSB2YWx1ZXNcbiAgICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSBkaWRuJ3QgY2hhbmdlLCBkbyBub3RoaW5nXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHRoaXMuX3ByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zZXRUZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWVbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0SXRlcmFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0Tm9kZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUudGhlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRQcm9taXNlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrLCB3aWxsIHJlbmRlciB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICAgICAgICB0aGlzLl9zZXRUZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfaW5zZXJ0KG5vZGUpIHtcbiAgICAgICAgdGhpcy5lbmROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxuICAgIF9zZXROb2RlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLl9wcmV2aW91c1ZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5faW5zZXJ0KHZhbHVlKTtcbiAgICAgICAgdGhpcy5fcHJldmlvdXNWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfc2V0VGV4dCh2YWx1ZSkge1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5zdGFydE5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogdmFsdWU7XG4gICAgICAgIGlmIChub2RlID09PSB0aGlzLmVuZE5vZGUucHJldmlvdXNTaWJsaW5nICYmXG4gICAgICAgICAgICBub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSkge1xuICAgICAgICAgICAgLy8gSWYgd2Ugb25seSBoYXZlIGEgc2luZ2xlIHRleHQgbm9kZSBiZXR3ZWVuIHRoZSBtYXJrZXJzLCB3ZSBjYW4ganVzdFxuICAgICAgICAgICAgLy8gc2V0IGl0cyB2YWx1ZSwgcmF0aGVyIHRoYW4gcmVwbGFjaW5nIGl0LlxuICAgICAgICAgICAgLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogQ2FuIHdlIGp1c3QgY2hlY2sgaWYgX3ByZXZpb3VzVmFsdWUgaXNcbiAgICAgICAgICAgIC8vIHByaW1pdGl2ZT9cbiAgICAgICAgICAgIG5vZGUudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldE5vZGUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcmV2aW91c1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIF9zZXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSkge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuaW5zdGFuY2UuX2dldFRlbXBsYXRlKHZhbHVlKTtcbiAgICAgICAgbGV0IGluc3RhbmNlO1xuICAgICAgICBpZiAodGhpcy5fcHJldmlvdXNWYWx1ZSAmJiB0aGlzLl9wcmV2aW91c1ZhbHVlLnRlbXBsYXRlID09PSB0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSB0aGlzLl9wcmV2aW91c1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSwgdGhpcy5pbnN0YW5jZS5fcGFydENhbGxiYWNrLCB0aGlzLmluc3RhbmNlLl9nZXRUZW1wbGF0ZSk7XG4gICAgICAgICAgICB0aGlzLl9zZXROb2RlKGluc3RhbmNlLl9jbG9uZSgpKTtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZpb3VzVmFsdWUgPSBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgICAgICBpbnN0YW5jZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICB9XG4gICAgX3NldEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgICAgIC8vIHZhbHVlIHRvIHRoZSBpdGVtLiBUaGlzIGlzIGEgbGl0dGxlIGJpdCBvZiBvdmVyaGVhZCBmb3IgZXZlcnkgaXRlbSBpblxuICAgICAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAgICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgICAgIC8vIGFycmF5Lm1hcCgoaSkgPT4gaHRtbGAke2l9YCksIGJ5IHJldXNpbmcgZXhpc3RpbmcgVGVtcGxhdGVJbnN0YW5jZXMuXG4gICAgICAgIC8vIElmIF9wcmV2aW91c1ZhbHVlIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBwcmV2aW91cyByZW5kZXIgd2FzIG9mIGFuXG4gICAgICAgIC8vIGl0ZXJhYmxlIGFuZCBfcHJldmlvdXNWYWx1ZSB3aWxsIGNvbnRhaW4gdGhlIE5vZGVQYXJ0cyBmcm9tIHRoZSBwcmV2aW91c1xuICAgICAgICAvLyByZW5kZXIuIElmIF9wcmV2aW91c1ZhbHVlIGlzIG5vdCBhbiBhcnJheSwgY2xlYXIgdGhpcyBwYXJ0IGFuZCBtYWtlIGEgbmV3XG4gICAgICAgIC8vIGFycmF5IGZvciBOb2RlUGFydHMuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLl9wcmV2aW91c1ZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNWYWx1ZSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgICAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgICAgIGNvbnN0IGl0ZW1QYXJ0cyA9IHRoaXMuX3ByZXZpb3VzVmFsdWU7XG4gICAgICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byByZXVzZSBhbiBleGlzdGluZyBwYXJ0XG4gICAgICAgICAgICBsZXQgaXRlbVBhcnQgPSBpdGVtUGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgIC8vIElmIG5vIGV4aXN0aW5nIHBhcnQsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgICAgIGlmIChpdGVtUGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgY3JlYXRpbmcgdGhlIGZpcnN0IGl0ZW0gcGFydCwgaXQncyBzdGFydE5vZGUgc2hvdWxkIGJlIHRoZVxuICAgICAgICAgICAgICAgIC8vIGNvbnRhaW5lcidzIHN0YXJ0Tm9kZVxuICAgICAgICAgICAgICAgIGxldCBpdGVtU3RhcnQgPSB0aGlzLnN0YXJ0Tm9kZTtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBub3QgY3JlYXRpbmcgdGhlIGZpcnN0IHBhcnQsIGNyZWF0ZSBhIG5ldyBzZXBhcmF0b3IgbWFya2VyXG4gICAgICAgICAgICAgICAgLy8gbm9kZSwgYW5kIGZpeCB1cCB0aGUgcHJldmlvdXMgcGFydCdzIGVuZE5vZGUgdG8gcG9pbnQgdG8gaXRcbiAgICAgICAgICAgICAgICBpZiAocGFydEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c1BhcnQgPSBpdGVtUGFydHNbcGFydEluZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1TdGFydCA9IHByZXZpb3VzUGFydC5lbmROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnNlcnQoaXRlbVN0YXJ0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXRlbVBhcnQgPSBuZXcgTm9kZVBhcnQodGhpcy5pbnN0YW5jZSwgaXRlbVN0YXJ0LCB0aGlzLmVuZE5vZGUpO1xuICAgICAgICAgICAgICAgIGl0ZW1QYXJ0cy5wdXNoKGl0ZW1QYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW1QYXJ0LnNldFZhbHVlKGl0ZW0pO1xuICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwYXJ0SW5kZXggPCBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0UGFydCA9IGl0ZW1QYXJ0c1twYXJ0SW5kZXggLSAxXTtcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfcHJldmlvdXNWYWx1ZSByZWZsZWN0cyB0aGUgY3VycmVudCBzdGF0ZVxuICAgICAgICAgICAgaXRlbVBhcnRzLmxlbmd0aCA9IHBhcnRJbmRleDtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIobGFzdFBhcnQuZW5kTm9kZS5wcmV2aW91c1NpYmxpbmcpO1xuICAgICAgICAgICAgbGFzdFBhcnQuZW5kTm9kZSA9IHRoaXMuZW5kTm9kZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfc2V0UHJvbWlzZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wcmV2aW91c1ZhbHVlID0gdmFsdWU7XG4gICAgICAgIHZhbHVlLnRoZW4oKHYpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9wcmV2aW91c1ZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUodik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjbGVhcihzdGFydE5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSkge1xuICAgICAgICByZW1vdmVOb2Rlcyh0aGlzLnN0YXJ0Tm9kZS5wYXJlbnROb2RlLCBzdGFydE5vZGUubmV4dFNpYmxpbmcsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGRlZmF1bHRQYXJ0Q2FsbGJhY2sgPSAoaW5zdGFuY2UsIHRlbXBsYXRlUGFydCwgbm9kZSkgPT4ge1xuICAgIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gJ2F0dHJpYnV0ZScpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVQYXJ0KGluc3RhbmNlLCBub2RlLCB0ZW1wbGF0ZVBhcnQubmFtZSwgdGVtcGxhdGVQYXJ0LnN0cmluZ3MpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgIHJldHVybiBuZXcgTm9kZVBhcnQoaW5zdGFuY2UsIG5vZGUsIG5vZGUubmV4dFNpYmxpbmcpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGFydCB0eXBlICR7dGVtcGxhdGVQYXJ0LnR5cGV9YCk7XG59O1xuLyoqXG4gKiBBbiBpbnN0YW5jZSBvZiBhIGBUZW1wbGF0ZWAgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gdGhlIERPTSBhbmQgdXBkYXRlZFxuICogd2l0aCBuZXcgdmFsdWVzLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVJbnN0YW5jZSB7XG4gICAgY29uc3RydWN0b3IodGVtcGxhdGUsIHBhcnRDYWxsYmFjaywgZ2V0VGVtcGxhdGUpIHtcbiAgICAgICAgdGhpcy5fcGFydHMgPSBbXTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICB0aGlzLl9wYXJ0Q2FsbGJhY2sgPSBwYXJ0Q2FsbGJhY2s7XG4gICAgICAgIHRoaXMuX2dldFRlbXBsYXRlID0gZ2V0VGVtcGxhdGU7XG4gICAgfVxuICAgIHVwZGF0ZSh2YWx1ZXMpIHtcbiAgICAgICAgbGV0IHZhbHVlSW5kZXggPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fcGFydHMpIHtcbiAgICAgICAgICAgIGlmICghcGFydCkge1xuICAgICAgICAgICAgICAgIHZhbHVlSW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHBhcnQuc2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFydC5zZXRWYWx1ZSh2YWx1ZXNbdmFsdWVJbmRleF0pO1xuICAgICAgICAgICAgICAgIHZhbHVlSW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnQuc2V0VmFsdWUodmFsdWVzLCB2YWx1ZUluZGV4KTtcbiAgICAgICAgICAgICAgICB2YWx1ZUluZGV4ICs9IHBhcnQuc2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfY2xvbmUoKSB7XG4gICAgICAgIC8vIENsb25lIHRoZSBub2RlLCByYXRoZXIgdGhhbiBpbXBvcnRpbmcgaXQsIHRvIGtlZXAgdGhlIGZyYWdtZW50IGluIHRoZVxuICAgICAgICAvLyB0ZW1wbGF0ZSdzIGRvY3VtZW50LiBUaGlzIGxlYXZlcyB0aGUgZnJhZ21lbnQgaW5lcnQgc28gY3VzdG9tIGVsZW1lbnRzXG4gICAgICAgIC8vIHdvbid0IHVwZ3JhZGUgdW50aWwgYWZ0ZXIgdGhlIG1haW4gZG9jdW1lbnQgYWRvcHRzIHRoZSBub2RlLlxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IHRoaXMudGVtcGxhdGUuZWxlbWVudC5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLnRlbXBsYXRlLnBhcnRzO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gRWRnZSBuZWVkcyBhbGwgNCBwYXJhbWV0ZXJzIHByZXNlbnQ7IElFMTEgbmVlZHMgM3JkIHBhcmFtZXRlciB0byBiZVxuICAgICAgICAgICAgLy8gbnVsbFxuICAgICAgICAgICAgY29uc3Qgd2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihmcmFnbWVudCwgMTMzIC8qIE5vZGVGaWx0ZXIuU0hPV19FTEVNRU5UIHwgTm9kZUZpbHRlci5TSE9XX0NPTU1FTlQgfFxuICAgICAgICAgICAgICAgICAgIE5vZGVGaWx0ZXIuU0hPV19URVhUICovLCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydEFjdGl2ZSA9IGlzVGVtcGxhdGVQYXJ0QWN0aXZlKHBhcnQpO1xuICAgICAgICAgICAgICAgIC8vIEFuIGluYWN0aXZlIHBhcnQgaGFzIG5vIGNvcmVzcG9uZGluZyBUZW1wbGF0ZSBub2RlLlxuICAgICAgICAgICAgICAgIGlmIChwYXJ0QWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpbmRleCA8IHBhcnQuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnRBY3RpdmUgPyB0aGlzLl9wYXJ0Q2FsbGJhY2sodGhpcywgcGFydCwgd2Fsa2VyLmN1cnJlbnROb2RlKSA6IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgIH1cbn1cbi8qKlxuICogUmVwYXJlbnRzIG5vZGVzLCBzdGFydGluZyBmcm9tIGBzdGFydE5vZGVgIChpbmNsdXNpdmUpIHRvIGBlbmROb2RlYFxuICogKGV4Y2x1c2l2ZSksIGludG8gYW5vdGhlciBjb250YWluZXIgKGNvdWxkIGJlIHRoZSBzYW1lIGNvbnRhaW5lciksIGJlZm9yZVxuICogYGJlZm9yZU5vZGVgLiBJZiBgYmVmb3JlTm9kZWAgaXMgbnVsbCwgaXQgYXBwZW5kcyB0aGUgbm9kZXMgdG8gdGhlXG4gKiBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCByZXBhcmVudE5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnQsIGVuZCA9IG51bGwsIGJlZm9yZSA9IG51bGwpID0+IHtcbiAgICBsZXQgbm9kZSA9IHN0YXJ0O1xuICAgIHdoaWxlIChub2RlICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobm9kZSwgYmVmb3JlKTtcbiAgICAgICAgbm9kZSA9IG47XG4gICAgfVxufTtcbi8qKlxuICogUmVtb3ZlcyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnROb2RlYCAoaW5jbHVzaXZlKSB0byBgZW5kTm9kZWBcbiAqIChleGNsdXNpdmUpLCBmcm9tIGBjb250YWluZXJgLlxuICovXG5leHBvcnQgY29uc3QgcmVtb3ZlTm9kZXMgPSAoY29udGFpbmVyLCBzdGFydE5vZGUsIGVuZE5vZGUgPSBudWxsKSA9PiB7XG4gICAgbGV0IG5vZGUgPSBzdGFydE5vZGU7XG4gICAgd2hpbGUgKG5vZGUgIT09IGVuZE5vZGUpIHtcbiAgICAgICAgY29uc3QgbiA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgbm9kZSA9IG47XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpdC1odG1sLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IGlzVGVtcGxhdGVQYXJ0QWN0aXZlIH0gZnJvbSAnLi4vbGl0LWh0bWwuanMnO1xuY29uc3Qgd2Fsa2VyTm9kZUZpbHRlciA9IE5vZGVGaWx0ZXIuU0hPV19FTEVNRU5UIHwgTm9kZUZpbHRlci5TSE9XX0NPTU1FTlQgfFxuICAgIE5vZGVGaWx0ZXIuU0hPV19URVhUO1xuLyoqXG4gKiBSZW1vdmVzIHRoZSBsaXN0IG9mIG5vZGVzIGZyb20gYSBUZW1wbGF0ZSBzYWZlbHkuIEluIGFkZGl0aW9uIHRvIHJlbW92aW5nXG4gKiBub2RlcyBmcm9tIHRoZSBUZW1wbGF0ZSwgdGhlIFRlbXBsYXRlIHBhcnQgaW5kaWNlcyBhcmUgdXBkYXRlZCB0byBtYXRjaFxuICogdGhlIG11dGF0ZWQgVGVtcGxhdGUgRE9NLlxuICpcbiAqIEFzIHRoZSB0ZW1wbGF0ZSBpcyB3YWxrZWQgdGhlIHJlbW92YWwgc3RhdGUgaXMgdHJhY2tlZCBhbmRcbiAqIHBhcnQgaW5kaWNlcyBhcmUgYWRqdXN0ZWQgYXMgbmVlZGVkLlxuICpcbiAqIGRpdlxuICogICBkaXYjMSAocmVtb3ZlKSA8LS0gc3RhcnQgcmVtb3ZpbmcgKHJlbW92aW5nIG5vZGUgaXMgZGl2IzEpXG4gKiAgICAgZGl2XG4gKiAgICAgICBkaXYjMiAocmVtb3ZlKSAgPC0tIGNvbnRpbnVlIHJlbW92aW5nIChyZW1vdmluZyBub2RlIGlzIHN0aWxsIGRpdiMxKVxuICogICAgICAgICBkaXZcbiAqIGRpdiA8LS0gc3RvcCByZW1vdmluZyBzaW5jZSBwcmV2aW91cyBzaWJsaW5nIGlzIHRoZSByZW1vdmluZyBub2RlIChkaXYjMSwgcmVtb3ZlZCA0IG5vZGVzKVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlTm9kZXNGcm9tVGVtcGxhdGUodGVtcGxhdGUsIG5vZGVzVG9SZW1vdmUpIHtcbiAgICBjb25zdCB7IGVsZW1lbnQ6IHsgY29udGVudCB9LCBwYXJ0cyB9ID0gdGVtcGxhdGU7XG4gICAgY29uc3Qgd2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihjb250ZW50LCB3YWxrZXJOb2RlRmlsdGVyLCBudWxsLCBmYWxzZSk7XG4gICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgbGV0IHBhcnQgPSBwYXJ0c1swXTtcbiAgICBsZXQgbm9kZUluZGV4ID0gLTE7XG4gICAgbGV0IHJlbW92ZUNvdW50ID0gMDtcbiAgICBjb25zdCBub2Rlc1RvUmVtb3ZlSW5UZW1wbGF0ZSA9IFtdO1xuICAgIGxldCBjdXJyZW50UmVtb3ZpbmdOb2RlID0gbnVsbDtcbiAgICB3aGlsZSAod2Fsa2VyLm5leHROb2RlKCkpIHtcbiAgICAgICAgbm9kZUluZGV4Kys7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB3YWxrZXIuY3VycmVudE5vZGU7XG4gICAgICAgIC8vIEVuZCByZW1vdmFsIGlmIHN0ZXBwZWQgcGFzdCB0aGUgcmVtb3Zpbmcgbm9kZVxuICAgICAgICBpZiAobm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IGN1cnJlbnRSZW1vdmluZ05vZGUpIHtcbiAgICAgICAgICAgIGN1cnJlbnRSZW1vdmluZ05vZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIEEgbm9kZSB0byByZW1vdmUgd2FzIGZvdW5kIGluIHRoZSB0ZW1wbGF0ZVxuICAgICAgICBpZiAobm9kZXNUb1JlbW92ZS5oYXMobm9kZSkpIHtcbiAgICAgICAgICAgIG5vZGVzVG9SZW1vdmVJblRlbXBsYXRlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAvLyBUcmFjayBub2RlIHdlJ3JlIHJlbW92aW5nXG4gICAgICAgICAgICBpZiAoY3VycmVudFJlbW92aW5nTm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRSZW1vdmluZ05vZGUgPSBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFdoZW4gcmVtb3ZpbmcsIGluY3JlbWVudCBjb3VudCBieSB3aGljaCB0byBhZGp1c3Qgc3Vic2VxdWVudCBwYXJ0IGluZGljZXNcbiAgICAgICAgaWYgKGN1cnJlbnRSZW1vdmluZ05vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJlbW92ZUNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHBhcnQgIT09IHVuZGVmaW5lZCAmJiBwYXJ0LmluZGV4ID09PSBub2RlSW5kZXgpIHtcbiAgICAgICAgICAgIC8vIElmIHBhcnQgaXMgaW4gYSByZW1vdmVkIG5vZGUgZGVhY3RpdmF0ZSBpdCBieSBzZXR0aW5nIGluZGV4IHRvIC0xIG9yXG4gICAgICAgICAgICAvLyBhZGp1c3QgdGhlIGluZGV4IGFzIG5lZWRlZC5cbiAgICAgICAgICAgIHBhcnQuaW5kZXggPSBjdXJyZW50UmVtb3ZpbmdOb2RlICE9PSBudWxsID8gLTEgOiBwYXJ0LmluZGV4IC0gcmVtb3ZlQ291bnQ7XG4gICAgICAgICAgICBwYXJ0ID0gcGFydHNbKytwYXJ0SW5kZXhdO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5vZGVzVG9SZW1vdmVJblRlbXBsYXRlLmZvckVhY2goKG4pID0+IG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKSk7XG59XG5jb25zdCBjb3VudE5vZGVzID0gKG5vZGUpID0+IHtcbiAgICBsZXQgY291bnQgPSAxO1xuICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIobm9kZSwgd2Fsa2VyTm9kZUZpbHRlciwgbnVsbCwgZmFsc2UpO1xuICAgIHdoaWxlICh3YWxrZXIubmV4dE5vZGUoKSkge1xuICAgICAgICBjb3VudCsrO1xuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG59O1xuY29uc3QgbmV4dEFjdGl2ZUluZGV4SW5UZW1wbGF0ZVBhcnRzID0gKHBhcnRzLCBzdGFydEluZGV4ID0gLTEpID0+IHtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleCArIDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgIGlmIChpc1RlbXBsYXRlUGFydEFjdGl2ZShwYXJ0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufTtcbi8qKlxuICogSW5zZXJ0cyB0aGUgZ2l2ZW4gbm9kZSBpbnRvIHRoZSBUZW1wbGF0ZSwgb3B0aW9uYWxseSBiZWZvcmUgdGhlIGdpdmVuXG4gKiByZWZOb2RlLiBJbiBhZGRpdGlvbiB0byBpbnNlcnRpbmcgdGhlIG5vZGUgaW50byB0aGUgVGVtcGxhdGUsIHRoZSBUZW1wbGF0ZVxuICogcGFydCBpbmRpY2VzIGFyZSB1cGRhdGVkIHRvIG1hdGNoIHRoZSBtdXRhdGVkIFRlbXBsYXRlIERPTS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc2VydE5vZGVJbnRvVGVtcGxhdGUodGVtcGxhdGUsIG5vZGUsIHJlZk5vZGUgPSBudWxsKSB7XG4gICAgY29uc3QgeyBlbGVtZW50OiB7IGNvbnRlbnQgfSwgcGFydHMgfSA9IHRlbXBsYXRlO1xuICAgIC8vIElmIHRoZXJlJ3Mgbm8gcmVmTm9kZSwgdGhlbiBwdXQgbm9kZSBhdCBlbmQgb2YgdGVtcGxhdGUuXG4gICAgLy8gTm8gcGFydCBpbmRpY2VzIG5lZWQgdG8gYmUgc2hpZnRlZCBpbiB0aGlzIGNhc2UuXG4gICAgaWYgKHJlZk5vZGUgPT09IG51bGwgfHwgcmVmTm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgd2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihjb250ZW50LCB3YWxrZXJOb2RlRmlsdGVyLCBudWxsLCBmYWxzZSk7XG4gICAgbGV0IHBhcnRJbmRleCA9IG5leHRBY3RpdmVJbmRleEluVGVtcGxhdGVQYXJ0cyhwYXJ0cyk7XG4gICAgbGV0IGluc2VydENvdW50ID0gMDtcbiAgICBsZXQgd2Fsa2VySW5kZXggPSAtMTtcbiAgICB3aGlsZSAod2Fsa2VyLm5leHROb2RlKCkpIHtcbiAgICAgICAgd2Fsa2VySW5kZXgrKztcbiAgICAgICAgY29uc3Qgd2Fsa2VyTm9kZSA9IHdhbGtlci5jdXJyZW50Tm9kZTtcbiAgICAgICAgaWYgKHdhbGtlck5vZGUgPT09IHJlZk5vZGUpIHtcbiAgICAgICAgICAgIHJlZk5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgcmVmTm9kZSk7XG4gICAgICAgICAgICBpbnNlcnRDb3VudCA9IGNvdW50Tm9kZXMobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHBhcnRJbmRleCAhPT0gLTEgJiYgcGFydHNbcGFydEluZGV4XS5pbmRleCA9PT0gd2Fsa2VySW5kZXgpIHtcbiAgICAgICAgICAgIC8vIElmIHdlJ3ZlIGluc2VydGVkIHRoZSBub2RlLCBzaW1wbHkgYWRqdXN0IGFsbCBzdWJzZXF1ZW50IHBhcnRzXG4gICAgICAgICAgICBpZiAoaW5zZXJ0Q291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHBhcnRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydHNbcGFydEluZGV4XS5pbmRleCArPSBpbnNlcnRDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4ID0gbmV4dEFjdGl2ZUluZGV4SW5UZW1wbGF0ZVBhcnRzKHBhcnRzLCBwYXJ0SW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0SW5kZXggPSBuZXh0QWN0aXZlSW5kZXhJblRlbXBsYXRlUGFydHMocGFydHMsIHBhcnRJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb2RpZnktdGVtcGxhdGUuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMsIFRlbXBsYXRlLCB0ZW1wbGF0ZUNhY2hlcywgVGVtcGxhdGVJbnN0YW5jZSB9IGZyb20gJy4uL2xpdC1odG1sLmpzJztcbmltcG9ydCB7IGluc2VydE5vZGVJbnRvVGVtcGxhdGUsIHJlbW92ZU5vZGVzRnJvbVRlbXBsYXRlIH0gZnJvbSAnLi9tb2RpZnktdGVtcGxhdGUuanMnO1xuZXhwb3J0IHsgaHRtbCwgc3ZnLCBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4uL2xpdC1odG1sLmpzJztcbi8vIEdldCBhIGtleSB0byBsb29rdXAgaW4gYHRlbXBsYXRlQ2FjaGVzYC5cbmNvbnN0IGdldFRlbXBsYXRlQ2FjaGVLZXkgPSAodHlwZSwgc2NvcGVOYW1lKSA9PiBgJHt0eXBlfS0tJHtzY29wZU5hbWV9YDtcbi8qKlxuICogVGVtcGxhdGUgZmFjdG9yeSB3aGljaCBzY29wZXMgdGVtcGxhdGUgRE9NIHVzaW5nIFNoYWR5Q1NTLlxuICogQHBhcmFtIHNjb3BlTmFtZSB7c3RyaW5nfVxuICovXG5jb25zdCBzaGFkeVRlbXBsYXRlRmFjdG9yeSA9IChzY29wZU5hbWUpID0+IChyZXN1bHQpID0+IHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGdldFRlbXBsYXRlQ2FjaGVLZXkocmVzdWx0LnR5cGUsIHNjb3BlTmFtZSk7XG4gICAgbGV0IHRlbXBsYXRlQ2FjaGUgPSB0ZW1wbGF0ZUNhY2hlcy5nZXQoY2FjaGVLZXkpO1xuICAgIGlmICh0ZW1wbGF0ZUNhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGVtcGxhdGVDYWNoZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGVtcGxhdGVDYWNoZXMuc2V0KGNhY2hlS2V5LCB0ZW1wbGF0ZUNhY2hlKTtcbiAgICB9XG4gICAgbGV0IHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSByZXN1bHQuZ2V0VGVtcGxhdGVFbGVtZW50KCk7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LlNoYWR5Q1NTID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgd2luZG93LlNoYWR5Q1NTLnByZXBhcmVUZW1wbGF0ZURvbShlbGVtZW50LCBzY29wZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHJlc3VsdCwgZWxlbWVudCk7XG4gICAgICAgIHRlbXBsYXRlQ2FjaGUuc2V0KHJlc3VsdC5zdHJpbmdzLCB0ZW1wbGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbn07XG5jb25zdCBURU1QTEFURV9UWVBFUyA9IFsnaHRtbCcsICdzdmcnXTtcbi8qKlxuICogUmVtb3ZlcyBhbGwgc3R5bGUgZWxlbWVudHMgZnJvbSBUZW1wbGF0ZXMgZm9yIHRoZSBnaXZlbiBzY29wZU5hbWUuXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlc0Zyb21MaXRUZW1wbGF0ZXMoc2NvcGVOYW1lKSB7XG4gICAgVEVNUExBVEVfVFlQRVMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZXMgPSB0ZW1wbGF0ZUNhY2hlcy5nZXQoZ2V0VGVtcGxhdGVDYWNoZUtleSh0eXBlLCBzY29wZU5hbWUpKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZXMuZm9yRWFjaCgodGVtcGxhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGVsZW1lbnQ6IHsgY29udGVudCB9IH0gPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHlsZXMgPSBjb250ZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlTm9kZXNGcm9tVGVtcGxhdGUodGVtcGxhdGUsIG5ldyBTZXQoQXJyYXkuZnJvbShzdHlsZXMpKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuY29uc3Qgc2hhZHlSZW5kZXJTZXQgPSBuZXcgU2V0KCk7XG4vKipcbiAqIEZvciB0aGUgZ2l2ZW4gc2NvcGUgbmFtZSwgZW5zdXJlcyB0aGF0IFNoYWR5Q1NTIHN0eWxlIHNjb3BpbmcgaXMgcGVyZm9ybWVkLlxuICogVGhpcyBpcyBkb25lIGp1c3Qgb25jZSBwZXIgc2NvcGUgbmFtZSBzbyB0aGUgZnJhZ21lbnQgYW5kIHRlbXBsYXRlIGNhbm5vdFxuICogYmUgbW9kaWZpZWQuXG4gKiAoMSkgZXh0cmFjdHMgc3R5bGVzIGZyb20gdGhlIHJlbmRlcmVkIGZyYWdtZW50IGFuZCBoYW5kcyB0aGVtIHRvIFNoYWR5Q1NTXG4gKiB0byBiZSBzY29wZWQgYW5kIGFwcGVuZGVkIHRvIHRoZSBkb2N1bWVudFxuICogKDIpIHJlbW92ZXMgc3R5bGUgZWxlbWVudHMgZnJvbSBhbGwgbGl0LWh0bWwgVGVtcGxhdGVzIGZvciB0aGlzIHNjb3BlIG5hbWUuXG4gKlxuICogTm90ZSwgPHN0eWxlPiBlbGVtZW50cyBjYW4gb25seSBiZSBwbGFjZWQgaW50byB0ZW1wbGF0ZXMgZm9yIHRoZVxuICogaW5pdGlhbCByZW5kZXJpbmcgb2YgdGhlIHNjb3BlLiBJZiA8c3R5bGU+IGVsZW1lbnRzIGFyZSBpbmNsdWRlZCBpbiB0ZW1wbGF0ZXNcbiAqIGR5bmFtaWNhbGx5IHJlbmRlcmVkIHRvIHRoZSBzY29wZSAoYWZ0ZXIgdGhlIGZpcnN0IHNjb3BlIHJlbmRlciksIHRoZXkgd2lsbFxuICogbm90IGJlIHNjb3BlZCBhbmQgdGhlIDxzdHlsZT4gd2lsbCBiZSBsZWZ0IGluIHRoZSB0ZW1wbGF0ZSBhbmQgcmVuZGVyZWQgb3V0cHV0LlxuICovXG5jb25zdCBlbnN1cmVTdHlsZXNTY29wZWQgPSAoZnJhZ21lbnQsIHRlbXBsYXRlLCBzY29wZU5hbWUpID0+IHtcbiAgICAvLyBvbmx5IHNjb3BlIGVsZW1lbnQgdGVtcGxhdGUgb25jZSBwZXIgc2NvcGUgbmFtZVxuICAgIGlmICghc2hhZHlSZW5kZXJTZXQuaGFzKHNjb3BlTmFtZSkpIHtcbiAgICAgICAgc2hhZHlSZW5kZXJTZXQuYWRkKHNjb3BlTmFtZSk7XG4gICAgICAgIGNvbnN0IHN0eWxlVGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgICBBcnJheS5mcm9tKGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3N0eWxlJykpLmZvckVhY2goKHMpID0+IHtcbiAgICAgICAgICAgIHN0eWxlVGVtcGxhdGUuY29udGVudC5hcHBlbmRDaGlsZChzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdpbmRvdy5TaGFkeUNTUy5wcmVwYXJlVGVtcGxhdGVTdHlsZXMoc3R5bGVUZW1wbGF0ZSwgc2NvcGVOYW1lKTtcbiAgICAgICAgLy8gRml4IHRlbXBsYXRlczogbm90ZSB0aGUgZXhwZWN0YXRpb24gaGVyZSBpcyB0aGF0IHRoZSBnaXZlbiBgZnJhZ21lbnRgXG4gICAgICAgIC8vIGhhcyBiZWVuIGdlbmVyYXRlZCBmcm9tIHRoZSBnaXZlbiBgdGVtcGxhdGVgIHdoaWNoIGNvbnRhaW5zXG4gICAgICAgIC8vIHRoZSBzZXQgb2YgdGVtcGxhdGVzIHJlbmRlcmVkIGludG8gdGhpcyBzY29wZS5cbiAgICAgICAgLy8gSXQgaXMgb25seSBmcm9tIHRoaXMgc2V0IG9mIGluaXRpYWwgdGVtcGxhdGVzIGZyb20gd2hpY2ggc3R5bGVzXG4gICAgICAgIC8vIHdpbGwgYmUgc2NvcGVkIGFuZCByZW1vdmVkLlxuICAgICAgICByZW1vdmVTdHlsZXNGcm9tTGl0VGVtcGxhdGVzKHNjb3BlTmFtZSk7XG4gICAgICAgIC8vIEFwcGx5U2hpbSBjYXNlXG4gICAgICAgIGlmICh3aW5kb3cuU2hhZHlDU1MubmF0aXZlU2hhZG93KSB7XG4gICAgICAgICAgICBjb25zdCBzdHlsZSA9IHN0eWxlVGVtcGxhdGUuY29udGVudC5xdWVyeVNlbGVjdG9yKCdzdHlsZScpO1xuICAgICAgICAgICAgaWYgKHN0eWxlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHN0eWxlIGludG8gcmVuZGVyZWQgZnJhZ21lbnRcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5pbnNlcnRCZWZvcmUoc3R5bGUsIGZyYWdtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgIC8vIEluc2VydCBpbnRvIGxpdC10ZW1wbGF0ZSAoZm9yIHN1YnNlcXVlbnQgcmVuZGVycylcbiAgICAgICAgICAgICAgICBpbnNlcnROb2RlSW50b1RlbXBsYXRlKHRlbXBsYXRlLCBzdHlsZS5jbG9uZU5vZGUodHJ1ZSksIHRlbXBsYXRlLmVsZW1lbnQuY29udGVudC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4vLyBOT1RFOiBXZSdyZSBjb3B5aW5nIGNvZGUgZnJvbSBsaXQtaHRtbCdzIGByZW5kZXJgIG1ldGhvZCBoZXJlLlxuLy8gV2UncmUgZG9pbmcgdGhpcyBleHBsaWNpdGx5IGJlY2F1c2UgdGhlIEFQSSBmb3IgcmVuZGVyaW5nIHRlbXBsYXRlcyBpcyBsaWtlbHlcbi8vIHRvIGNoYW5nZSBpbiB0aGUgbmVhciB0ZXJtLlxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihyZXN1bHQsIGNvbnRhaW5lciwgc2NvcGVOYW1lKSB7XG4gICAgY29uc3QgdGVtcGxhdGVGYWN0b3J5ID0gc2hhZHlUZW1wbGF0ZUZhY3Rvcnkoc2NvcGVOYW1lKTtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRlbXBsYXRlRmFjdG9yeShyZXN1bHQpO1xuICAgIGxldCBpbnN0YW5jZSA9IGNvbnRhaW5lci5fX3RlbXBsYXRlSW5zdGFuY2U7XG4gICAgLy8gUmVwZWF0IHJlbmRlciwganVzdCBjYWxsIHVwZGF0ZSgpXG4gICAgaWYgKGluc3RhbmNlICE9PSB1bmRlZmluZWQgJiYgaW5zdGFuY2UudGVtcGxhdGUgPT09IHRlbXBsYXRlICYmXG4gICAgICAgIGluc3RhbmNlLl9wYXJ0Q2FsbGJhY2sgPT09IHJlc3VsdC5wYXJ0Q2FsbGJhY2spIHtcbiAgICAgICAgaW5zdGFuY2UudXBkYXRlKHJlc3VsdC52YWx1ZXMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIEZpcnN0IHJlbmRlciwgY3JlYXRlIGEgbmV3IFRlbXBsYXRlSW5zdGFuY2UgYW5kIGFwcGVuZCBpdFxuICAgIGluc3RhbmNlID1cbiAgICAgICAgbmV3IFRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUsIHJlc3VsdC5wYXJ0Q2FsbGJhY2ssIHRlbXBsYXRlRmFjdG9yeSk7XG4gICAgY29udGFpbmVyLl9fdGVtcGxhdGVJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKCk7XG4gICAgaW5zdGFuY2UudXBkYXRlKHJlc3VsdC52YWx1ZXMpO1xuICAgIGNvbnN0IGhvc3QgPSBjb250YWluZXIgaW5zdGFuY2VvZiBTaGFkb3dSb290ID9cbiAgICAgICAgY29udGFpbmVyLmhvc3QgOlxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLy8gSWYgdGhlcmUncyBhIHNoYWRvdyBob3N0LCBkbyBTaGFkeUNTUyBzY29waW5nLi4uXG4gICAgaWYgKGhvc3QgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygd2luZG93LlNoYWR5Q1NTID09PSAnb2JqZWN0Jykge1xuICAgICAgICBlbnN1cmVTdHlsZXNTY29wZWQoZnJhZ21lbnQsIHRlbXBsYXRlLCBzY29wZU5hbWUpO1xuICAgICAgICB3aW5kb3cuU2hhZHlDU1Muc3R5bGVFbGVtZW50KGhvc3QpO1xuICAgIH1cbiAgICByZW1vdmVOb2Rlcyhjb250YWluZXIsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2hhZHktcmVuZGVyLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmltcG9ydCB7IEF0dHJpYnV0ZVBhcnQsIGRlZmF1bHRQYXJ0Q2FsbGJhY2ssIG5vQ2hhbmdlLCBnZXRWYWx1ZSwgU1ZHVGVtcGxhdGVSZXN1bHQsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnLi4vbGl0LWh0bWwuanMnO1xuZXhwb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi4vbGl0LWh0bWwuanMnO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhIGxpdC1leHRlbmRlZCBIVE1MIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IChzdHJpbmdzLCAuLi52YWx1ZXMpID0+IG5ldyBUZW1wbGF0ZVJlc3VsdChzdHJpbmdzLCB2YWx1ZXMsICdodG1sJywgZXh0ZW5kZWRQYXJ0Q2FsbGJhY2spO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhIGxpdC1leHRlbmRlZCBTVkcgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjb25zdCBzdmcgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgU1ZHVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnc3ZnJywgZXh0ZW5kZWRQYXJ0Q2FsbGJhY2spO1xuLyoqXG4gKiBBIFBhcnRDYWxsYmFjayB3aGljaCBhbGxvd3MgdGVtcGxhdGVzIHRvIHNldCBwcm9wZXJ0aWVzIGFuZCBkZWNsYXJhdGl2ZVxuICogZXZlbnQgaGFuZGxlcnMuXG4gKlxuICogUHJvcGVydGllcyBhcmUgc2V0IGJ5IGRlZmF1bHQsIGluc3RlYWQgb2YgYXR0cmlidXRlcy4gQXR0cmlidXRlIG5hbWVzIGluXG4gKiBsaXQtaHRtbCB0ZW1wbGF0ZXMgcHJlc2VydmUgY2FzZSwgc28gcHJvcGVydGllcyBhcmUgY2FzZSBzZW5zaXRpdmUuIElmIGFuXG4gKiBleHByZXNzaW9uIHRha2VzIHVwIGFuIGVudGlyZSBhdHRyaWJ1dGUgdmFsdWUsIHRoZW4gdGhlIHByb3BlcnR5IGlzIHNldCB0b1xuICogdGhhdCB2YWx1ZS4gSWYgYW4gZXhwcmVzc2lvbiBpcyBpbnRlcnBvbGF0ZWQgd2l0aCBhIHN0cmluZyBvciBvdGhlclxuICogZXhwcmVzc2lvbnMgdGhlbiB0aGUgcHJvcGVydHkgaXMgc2V0IHRvIHRoZSBzdHJpbmcgcmVzdWx0IG9mIHRoZVxuICogaW50ZXJwb2xhdGlvbi5cbiAqXG4gKiBUbyBzZXQgYW4gYXR0cmlidXRlIGluc3RlYWQgb2YgYSBwcm9wZXJ0eSwgYXBwZW5kIGEgYCRgIHN1ZmZpeCB0byB0aGVcbiAqIGF0dHJpYnV0ZSBuYW1lLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgIGh0bWxgPGJ1dHRvbiBjbGFzcyQ9XCJwcmltYXJ5XCI+QnV5IE5vdzwvYnV0dG9uPmBcbiAqXG4gKiBUbyBzZXQgYW4gZXZlbnQgaGFuZGxlciwgcHJlZml4IHRoZSBhdHRyaWJ1dGUgbmFtZSB3aXRoIGBvbi1gOlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgIGh0bWxgPGJ1dHRvbiBvbi1jbGljaz0keyhlKT0+IHRoaXMub25DbGlja0hhbmRsZXIoZSl9PkJ1eSBOb3c8L2J1dHRvbj5gXG4gKlxuICovXG5leHBvcnQgY29uc3QgZXh0ZW5kZWRQYXJ0Q2FsbGJhY2sgPSAoaW5zdGFuY2UsIHRlbXBsYXRlUGFydCwgbm9kZSkgPT4ge1xuICAgIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gJ2F0dHJpYnV0ZScpIHtcbiAgICAgICAgaWYgKHRlbXBsYXRlUGFydC5yYXdOYW1lLnN1YnN0cigwLCAzKSA9PT0gJ29uLScpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IHRlbXBsYXRlUGFydC5yYXdOYW1lLnNsaWNlKDMpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFdmVudFBhcnQoaW5zdGFuY2UsIG5vZGUsIGV2ZW50TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGFzdENoYXIgPSB0ZW1wbGF0ZVBhcnQubmFtZS5zdWJzdHIodGVtcGxhdGVQYXJ0Lm5hbWUubGVuZ3RoIC0gMSk7XG4gICAgICAgIGlmIChsYXN0Q2hhciA9PT0gJyQnKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdGVtcGxhdGVQYXJ0Lm5hbWUuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVQYXJ0KGluc3RhbmNlLCBub2RlLCBuYW1lLCB0ZW1wbGF0ZVBhcnQuc3RyaW5ncyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhc3RDaGFyID09PSAnPycpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB0ZW1wbGF0ZVBhcnQubmFtZS5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0KGluc3RhbmNlLCBub2RlLCBuYW1lLCB0ZW1wbGF0ZVBhcnQuc3RyaW5ncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVBhcnQoaW5zdGFuY2UsIG5vZGUsIHRlbXBsYXRlUGFydC5yYXdOYW1lLCB0ZW1wbGF0ZVBhcnQuc3RyaW5ncyk7XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0UGFydENhbGxiYWNrKGluc3RhbmNlLCB0ZW1wbGF0ZVBhcnQsIG5vZGUpO1xufTtcbi8qKlxuICogSW1wbGVtZW50cyBhIGJvb2xlYW4gYXR0cmlidXRlLCByb3VnaGx5IGFzIGRlZmluZWQgaW4gdGhlIEhUTUxcbiAqIHNwZWNpZmljYXRpb24uXG4gKlxuICogSWYgdGhlIHZhbHVlIGlzIHRydXRoeSwgdGhlbiB0aGUgYXR0cmlidXRlIGlzIHByZXNlbnQgd2l0aCBhIHZhbHVlIG9mXG4gKiAnJy4gSWYgdGhlIHZhbHVlIGlzIGZhbHNleSwgdGhlIGF0dHJpYnV0ZSBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgY2xhc3MgQm9vbGVhbkF0dHJpYnV0ZVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgICBzZXRWYWx1ZSh2YWx1ZXMsIHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuc3RyaW5ncztcbiAgICAgICAgaWYgKHMubGVuZ3RoID09PSAyICYmIHNbMF0gPT09ICcnICYmIHNbMV0gPT09ICcnKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFZhbHVlKHRoaXMsIHZhbHVlc1tzdGFydEluZGV4XSk7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYm9vbGVhbiBhdHRyaWJ1dGVzIGNhbiBvbmx5IGNvbnRhaW4gYSBzaW5nbGUgZXhwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICAgIHNldFZhbHVlKHZhbHVlcywgc3RhcnRJbmRleCkge1xuICAgICAgICBjb25zdCBzID0gdGhpcy5zdHJpbmdzO1xuICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLl9lcXVhbFRvUHJldmlvdXNWYWx1ZXModmFsdWVzLCBzdGFydEluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzLmxlbmd0aCA9PT0gMiAmJiBzWzBdID09PSAnJyAmJiBzWzFdID09PSAnJykge1xuICAgICAgICAgICAgLy8gQW4gZXhwcmVzc2lvbiB0aGF0IG9jY3VwaWVzIHRoZSB3aG9sZSBhdHRyaWJ1dGUgdmFsdWUgd2lsbCBsZWF2ZVxuICAgICAgICAgICAgLy8gbGVhZGluZyBhbmQgdHJhaWxpbmcgZW1wdHkgc3RyaW5ncy5cbiAgICAgICAgICAgIHZhbHVlID0gZ2V0VmFsdWUodGhpcywgdmFsdWVzW3N0YXJ0SW5kZXhdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEludGVycG9sYXRpb24sIHNvIGludGVycG9sYXRlXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX2ludGVycG9sYXRlKHZhbHVlcywgc3RhcnRJbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlICE9PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50W3RoaXMubmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcmV2aW91c1ZhbHVlcyA9IHZhbHVlcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRXZlbnRQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihpbnN0YW5jZSwgZWxlbWVudCwgZXZlbnROYW1lKSB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gZ2V0VmFsdWUodGhpcywgdmFsdWUpO1xuICAgICAgICBpZiAobGlzdGVuZXIgPT09IHRoaXMuX2xpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3RlbmVyID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl9saXN0ZW5lciA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50TmFtZSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICB9XG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXIuY2FsbCh0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5fbGlzdGVuZXIuaGFuZGxlRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyLmhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpdC1leHRlbmRlZC5qcy5tYXAiLCJpbXBvcnQgeyBQcm9wZXJ0aWVzTWl4aW4gfSBmcm9tICdAcG9seW1lci9wb2x5bWVyL2xpYi9taXhpbnMvcHJvcGVydGllcy1taXhpbi5qcyc7XG5pbXBvcnQgeyBjYW1lbFRvRGFzaENhc2UgfSBmcm9tICdAcG9seW1lci9wb2x5bWVyL2xpYi91dGlscy9jYXNlLW1hcC5qcyc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICdsaXQtaHRtbC9saWIvc2hhZHktcmVuZGVyLmpzJztcbmV4cG9ydCB7IGh0bWwsIHN2ZyB9IGZyb20gJ2xpdC1odG1sL2xpYi9saXQtZXh0ZW5kZWQuanMnO1xuLyoqXG4gKiBSZW5kZXJzIGF0dHJpYnV0ZXMgdG8gdGhlIGdpdmVuIGVsZW1lbnQgYmFzZWQgb24gdGhlIGBhdHRySW5mb2Agb2JqZWN0IHdoZXJlXG4gKiBib29sZWFuIHZhbHVlcyBhcmUgYWRkZWQvcmVtb3ZlZCBhcyBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCBvbiB3aGljaCB0byBzZXQgYXR0cmlidXRlcy5cbiAqIEBwYXJhbSBhdHRySW5mbyBPYmplY3QgZGVzY3JpYmluZyBhdHRyaWJ1dGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQXR0cmlidXRlcyhlbGVtZW50LCBhdHRySW5mbykge1xuICAgIGZvciAoY29uc3QgYSBpbiBhdHRySW5mbykge1xuICAgICAgICBjb25zdCB2ID0gYXR0ckluZm9bYV0gPT09IHRydWUgPyAnJyA6IGF0dHJJbmZvW2FdO1xuICAgICAgICBpZiAodiB8fCB2ID09PSAnJyB8fCB2ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoYSkgIT09IHYpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhLCBTdHJpbmcodikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKGEpKSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyBvZiBjc3MgY2xhc3MgbmFtZXMgZm9ybWVkIGJ5IHRha2luZyB0aGUgcHJvcGVydGllc1xuICogaW4gdGhlIGBjbGFzc0luZm9gIG9iamVjdCBhbmQgYXBwZW5kaW5nIHRoZSBwcm9wZXJ0eSBuYW1lIHRvIHRoZSBzdHJpbmcgb2ZcbiAqIGNsYXNzIG5hbWVzIGlmIHRoZSBwcm9wZXJ0eSB2YWx1ZSBpcyB0cnV0aHkuXG4gKiBAcGFyYW0gY2xhc3NJbmZvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc1N0cmluZyhjbGFzc0luZm8pIHtcbiAgICBjb25zdCBvID0gW107XG4gICAgZm9yIChjb25zdCBuYW1lIGluIGNsYXNzSW5mbykge1xuICAgICAgICBjb25zdCB2ID0gY2xhc3NJbmZvW25hbWVdO1xuICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgby5wdXNoKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvLmpvaW4oJyAnKTtcbn1cbi8qKlxuICogUmV0dXJucyBhIGNzcyBzdHlsZSBzdHJpbmcgZm9ybWVkIGJ5IHRha2luZyB0aGUgcHJvcGVydGllcyBpbiB0aGUgYHN0eWxlSW5mb2BcbiAqIG9iamVjdCBhbmQgYXBwZW5kaW5nIHRoZSBwcm9wZXJ0eSBuYW1lIChkYXNoLWNhc2VkKSBjb2xvbiB0aGVcbiAqIHByb3BlcnR5IHZhbHVlLiBQcm9wZXJ0aWVzIGFyZSBzZXBhcmF0ZWQgYnkgYSBzZW1pLWNvbG9uLlxuICogQHBhcmFtIHN0eWxlSW5mb1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVTdHJpbmcoc3R5bGVJbmZvKSB7XG4gICAgY29uc3QgbyA9IFtdO1xuICAgIGZvciAoY29uc3QgbmFtZSBpbiBzdHlsZUluZm8pIHtcbiAgICAgICAgY29uc3QgdiA9IHN0eWxlSW5mb1tuYW1lXTtcbiAgICAgICAgaWYgKHYgfHwgdiA9PT0gMCkge1xuICAgICAgICAgICAgby5wdXNoKGAke2NhbWVsVG9EYXNoQ2FzZShuYW1lKX06ICR7dn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gby5qb2luKCc7ICcpO1xufVxuZXhwb3J0IGNsYXNzIExpdEVsZW1lbnQgZXh0ZW5kcyBQcm9wZXJ0aWVzTWl4aW4oSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5fX3JlbmRlckNvbXBsZXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fX3Jlc29sdmVSZW5kZXJDb21wbGV0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX19pc0ludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgd2hpY2ggc2V0cyB1cCBlbGVtZW50IHJlbmRlcmluZyBieSBjYWxsaW5nKiBgX2NyZWF0ZVJvb3RgXG4gICAgICogYW5kIGBfZmlyc3RSZW5kZXJlZGAuXG4gICAgICovXG4gICAgcmVhZHkoKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSB0aGlzLl9jcmVhdGVSb290KCk7XG4gICAgICAgIHN1cGVyLnJlYWR5KCk7XG4gICAgICAgIHRoaXMuX2ZpcnN0UmVuZGVyZWQoKTtcbiAgICB9XG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIGlmICh3aW5kb3cuU2hhZHlDU1MgJiYgdGhpcy5fcm9vdCkge1xuICAgICAgICAgICAgd2luZG93LlNoYWR5Q1NTLnN0eWxlRWxlbWVudCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgYWZ0ZXIgdGhlIGVsZW1lbnQgRE9NIGlzIHJlbmRlcmVkIGZvciB0aGUgZmlyc3QgdGltZS5cbiAgICAgKiBJbXBsZW1lbnQgdG8gcGVyZm9ybSB0YXNrcyBhZnRlciBmaXJzdCByZW5kZXJpbmcgbGlrZSBjYXB0dXJpbmcgYVxuICAgICAqIHJlZmVyZW5jZSB0byBhIHN0YXRpYyBub2RlIHdoaWNoIG11c3QgYmUgZGlyZWN0bHkgbWFuaXB1bGF0ZWQuXG4gICAgICogVGhpcyBzaG91bGQgbm90IGJlIGNvbW1vbmx5IG5lZWRlZC4gRm9yIHRhc2tzIHdoaWNoIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAgICAgKiBiZWZvcmUgZmlyc3QgcmVuZGVyLCB1c2UgdGhlIGVsZW1lbnQgY29uc3RydWN0b3IuXG4gICAgICovXG4gICAgX2ZpcnN0UmVuZGVyZWQoKSB7IH1cbiAgICAvKipcbiAgICAgKiBJbXBsZW1lbnQgdG8gY3VzdG9taXplIHdoZXJlIHRoZSBlbGVtZW50J3MgdGVtcGxhdGUgaXMgcmVuZGVyZWQgYnlcbiAgICAgKiByZXR1cm5pbmcgYW4gZWxlbWVudCBpbnRvIHdoaWNoIHRvIHJlbmRlci4gQnkgZGVmYXVsdCB0aGlzIGNyZWF0ZXNcbiAgICAgKiBhIHNoYWRvd1Jvb3QgZm9yIHRoZSBlbGVtZW50LiBUbyByZW5kZXIgaW50byB0aGUgZWxlbWVudCdzIGNoaWxkTm9kZXMsXG4gICAgICogcmV0dXJuIGB0aGlzYC5cbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fSBSZXR1cm5zIGEgbm9kZSBpbnRvIHdoaWNoIHRvIHJlbmRlci5cbiAgICAgKi9cbiAgICBfY3JlYXRlUm9vdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB3aGljaCByZXR1cm5zIHRoZSB2YWx1ZSBvZiBgX3Nob3VsZFJlbmRlcmAgd2hpY2ggdXNlcnNcbiAgICAgKiBzaG91bGQgaW1wbGVtZW50IHRvIGNvbnRyb2wgcmVuZGVyaW5nLiBJZiB0aGlzIG1ldGhvZCByZXR1cm5zIGZhbHNlLFxuICAgICAqIF9wcm9wZXJ0aWVzQ2hhbmdlZCB3aWxsIG5vdCBiZSBjYWxsZWQgYW5kIG5vIHJlbmRlcmluZyB3aWxsIG9jY3VyIGV2ZW5cbiAgICAgKiBpZiBwcm9wZXJ0eSB2YWx1ZXMgY2hhbmdlIG9yIGByZXF1ZXN0UmVuZGVyYCBpcyBjYWxsZWQuXG4gICAgICogQHBhcmFtIF9wcm9wcyBDdXJyZW50IGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSBfY2hhbmdlZFByb3BzIENoYW5naW5nIGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSBfcHJldlByb3BzIFByZXZpb3VzIGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBEZWZhdWx0IGltcGxlbWVudGF0aW9uIGFsd2F5cyByZXR1cm5zIHRydWUuXG4gICAgICovXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoX3Byb3BzLCBfY2hhbmdlZFByb3BzLCBfcHJldlByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNob3VsZFJlbmRlciA9IHRoaXMuX3Nob3VsZFJlbmRlcihfcHJvcHMsIF9jaGFuZ2VkUHJvcHMsIF9wcmV2UHJvcHMpO1xuICAgICAgICBpZiAoIXNob3VsZFJlbmRlciAmJiB0aGlzLl9fcmVzb2x2ZVJlbmRlckNvbXBsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9fcmVzb2x2ZVJlbmRlckNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2hvdWxkUmVuZGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbXBsZW1lbnQgdG8gY29udHJvbCBpZiByZW5kZXJpbmcgc2hvdWxkIG9jY3VyIHdoZW4gcHJvcGVydHkgdmFsdWVzXG4gICAgICogY2hhbmdlIG9yIGByZXF1ZXN0UmVuZGVyYCBpcyBjYWxsZWQuIEJ5IGRlZmF1bHQsIHRoaXMgbWV0aG9kIGFsd2F5c1xuICAgICAqIHJldHVybnMgdHJ1ZSwgYnV0IHRoaXMgY2FuIGJlIGN1c3RvbWl6ZWQgYXMgYW4gb3B0aW1pemF0aW9uIHRvIGF2b2lkXG4gICAgICogcmVuZGVyaW5nIHdvcmsgd2hlbiBjaGFuZ2VzIG9jY3VyIHdoaWNoIHNob3VsZCBub3QgYmUgcmVuZGVyZWQuXG4gICAgICogQHBhcmFtIF9wcm9wcyBDdXJyZW50IGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSBfY2hhbmdlZFByb3BzIENoYW5naW5nIGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSBfcHJldlByb3BzIFByZXZpb3VzIGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBEZWZhdWx0IGltcGxlbWVudGF0aW9uIGFsd2F5cyByZXR1cm5zIHRydWUuXG4gICAgICovXG4gICAgX3Nob3VsZFJlbmRlcihfcHJvcHMsIF9jaGFuZ2VkUHJvcHMsIF9wcmV2UHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHdoaWNoIHBlcmZvcm1zIGVsZW1lbnQgcmVuZGVyaW5nIGJ5IGNhbGxpbmdcbiAgICAgKiBgX3JlbmRlcmAsIGBfYXBwbHlSZW5kZXJgLCBhbmQgZmluYWxseSBgX2RpZFJlbmRlcmAuXG4gICAgICogQHBhcmFtIHByb3BzIEN1cnJlbnQgZWxlbWVudCBwcm9wZXJ0aWVzXG4gICAgICogQHBhcmFtIGNoYW5nZWRQcm9wcyBDaGFuZ2luZyBlbGVtZW50IHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0gcHJldlByb3BzIFByZXZpb3VzIGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqL1xuICAgIF9wcm9wZXJ0aWVzQ2hhbmdlZChwcm9wcywgY2hhbmdlZFByb3BzLCBwcmV2UHJvcHMpIHtcbiAgICAgICAgc3VwZXIuX3Byb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIHByZXZQcm9wcyk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3JlbmRlcihwcm9wcyk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgdGhpcy5fcm9vdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9hcHBseVJlbmRlcihyZXN1bHQsIHRoaXMuX3Jvb3QpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RpZFJlbmRlcihwcm9wcywgY2hhbmdlZFByb3BzLCBwcmV2UHJvcHMpO1xuICAgICAgICBpZiAodGhpcy5fX3Jlc29sdmVSZW5kZXJDb21wbGV0ZSkge1xuICAgICAgICAgICAgdGhpcy5fX3Jlc29sdmVSZW5kZXJDb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfZmx1c2hQcm9wZXJ0aWVzKCkge1xuICAgICAgICB0aGlzLl9faXNDaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX19pc0ludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgc3VwZXIuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICB0aGlzLl9faXNDaGFuZ2luZyA9IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB3aGljaCB3YXJucyB3aGVuIGEgdXNlciBhdHRlbXB0cyB0byBjaGFuZ2UgYSBwcm9wZXJ0eSBkdXJpbmdcbiAgICAgKiB0aGUgcmVuZGVyaW5nIGxpZmVjeWNsZS4gVGhpcyBpcyBhbiBhbnRpLXBhdHRlcm4gYW5kIHNob3VsZCBiZSBhdm9pZGVkLlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eSB7c3RyaW5nfVxuICAgICAqIEBwYXJhbSB2YWx1ZSB7YW55fVxuICAgICAqIEBwYXJhbSBvbGQge2FueX1cbiAgICAgKi9cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgbm8tYW55XG4gICAgX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG4gICAgICAgIGNvbnN0IGNoYW5nZSA9IHN1cGVyLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICAgIGlmIChjaGFuZ2UgJiYgdGhpcy5fX2lzQ2hhbmdpbmcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUudHJhY2UoYFNldHRpbmcgcHJvcGVydGllcyBpbiByZXNwb25zZSB0byBvdGhlciBwcm9wZXJ0aWVzIGNoYW5naW5nIGAgK1xuICAgICAgICAgICAgICAgIGBjb25zaWRlcmVkIGhhcm1mdWwuIFNldHRpbmcgJyR7cHJvcGVydHl9JyBmcm9tIGAgK1xuICAgICAgICAgICAgICAgIGAnJHt0aGlzLl9nZXRQcm9wZXJ0eShwcm9wZXJ0eSl9JyB0byAnJHt2YWx1ZX0nLmApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGFuZ2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEltcGxlbWVudCB0byBkZXNjcmliZSB0aGUgRE9NIHdoaWNoIHNob3VsZCBiZSByZW5kZXJlZCBpbiB0aGUgZWxlbWVudC5cbiAgICAgKiBJZGVhbGx5LCB0aGUgaW1wbGVtZW50YXRpb24gaXMgYSBwdXJlIGZ1bmN0aW9uIHVzaW5nIG9ubHkgcHJvcHMgdG8gZGVzY3JpYmVcbiAgICAgKiB0aGUgZWxlbWVudCB0ZW1wbGF0ZS4gVGhlIGltcGxlbWVudGF0aW9uIG11c3QgcmV0dXJuIGEgYGxpdC1odG1sYFxuICAgICAqIFRlbXBsYXRlUmVzdWx0LiBCeSBkZWZhdWx0IHRoaXMgdGVtcGxhdGUgaXMgcmVuZGVyZWQgaW50byB0aGUgZWxlbWVudCdzXG4gICAgICogc2hhZG93Um9vdC4gVGhpcyBjYW4gYmUgY3VzdG9taXplZCBieSBpbXBsZW1lbnRpbmcgYF9jcmVhdGVSb290YC4gVGhpc1xuICAgICAqIG1ldGhvZCBtdXN0IGJlIGltcGxlbWVudGVkLlxuICAgICAqIEBwYXJhbSB7Kn0gX3Byb3BzIEN1cnJlbnQgZWxlbWVudCBwcm9wZXJ0aWVzXG4gICAgICogQHJldHVybnMge1RlbXBsYXRlUmVzdWx0fSBNdXN0IHJldHVybiBhIGxpdC1odG1sIFRlbXBsYXRlUmVzdWx0LlxuICAgICAqL1xuICAgIF9yZW5kZXIoX3Byb3BzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignX3JlbmRlcigpIG5vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRoZSBnaXZlbiBsaXQtaHRtbCB0ZW1wbGF0ZSBgcmVzdWx0YCBpbnRvIHRoZSBnaXZlbiBgbm9kZWAuXG4gICAgICogSW1wbGVtZW50IHRvIGN1c3RvbWl6ZSB0aGUgd2F5IHJlbmRlcmluZyBpcyBhcHBsaWVkLiBUaGlzIGlzIHNob3VsZCBub3RcbiAgICAgKiB0eXBpY2FsbHkgYmUgbmVlZGVkIGFuZCBpcyBwcm92aWRlZCBmb3IgYWR2YW5jZWQgdXNlIGNhc2VzLlxuICAgICAqIEBwYXJhbSByZXN1bHQge1RlbXBsYXRlUmVzdWx0fSBgbGl0LWh0bWxgIHRlbXBsYXRlIHJlc3VsdCB0byByZW5kZXJcbiAgICAgKiBAcGFyYW0gbm9kZSB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fSBub2RlIGludG8gd2hpY2ggdG8gcmVuZGVyXG4gICAgICovXG4gICAgX2FwcGx5UmVuZGVyKHJlc3VsdCwgbm9kZSkge1xuICAgICAgICByZW5kZXIocmVzdWx0LCBub2RlLCB0aGlzLmxvY2FsTmFtZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxlZCBhZnRlciBlbGVtZW50IERPTSBoYXMgYmVlbiByZW5kZXJlZC4gSW1wbGVtZW50IHRvXG4gICAgICogZGlyZWN0bHkgY29udHJvbCByZW5kZXJlZCBET00uIFR5cGljYWxseSB0aGlzIGlzIG5vdCBuZWVkZWQgYXMgYGxpdC1odG1sYFxuICAgICAqIGNhbiBiZSB1c2VkIGluIHRoZSBgX3JlbmRlcmAgbWV0aG9kIHRvIHNldCBwcm9wZXJ0aWVzLCBhdHRyaWJ1dGVzLCBhbmRcbiAgICAgKiBldmVudCBsaXN0ZW5lcnMuIEhvd2V2ZXIsIGl0IGlzIHNvbWV0aW1lcyB1c2VmdWwgZm9yIGNhbGxpbmcgbWV0aG9kcyBvblxuICAgICAqIHJlbmRlcmVkIGVsZW1lbnRzLCBsaWtlIGNhbGxpbmcgYGZvY3VzKClgIG9uIGFuIGVsZW1lbnQgdG8gZm9jdXMgaXQuXG4gICAgICogQHBhcmFtIF9wcm9wcyBDdXJyZW50IGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSBfY2hhbmdlZFByb3BzIENoYW5naW5nIGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSBfcHJldlByb3BzIFByZXZpb3VzIGVsZW1lbnQgcHJvcGVydGllc1xuICAgICAqL1xuICAgIF9kaWRSZW5kZXIoX3Byb3BzLCBfY2hhbmdlZFByb3BzLCBfcHJldlByb3BzKSB7IH1cbiAgICAvKipcbiAgICAgKiBDYWxsIHRvIHJlcXVlc3QgdGhlIGVsZW1lbnQgdG8gYXN5bmNocm9ub3VzbHkgcmUtcmVuZGVyIHJlZ2FyZGxlc3NcbiAgICAgKiBvZiB3aGV0aGVyIG9yIG5vdCBhbnkgcHJvcGVydHkgY2hhbmdlcyBhcmUgcGVuZGluZy5cbiAgICAgKi9cbiAgICByZXF1ZXN0UmVuZGVyKCkgeyB0aGlzLl9pbnZhbGlkYXRlUHJvcGVydGllcygpOyB9XG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgd2hpY2ggcHJvdmlkZXMgdHJhY2tpbmcgb2YgaW52YWxpZGF0ZWQgc3RhdGUuXG4gICAgICovXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgICB0aGlzLl9faXNJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgc3VwZXIuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIGFmdGVyIHRoZSBlbGVtZW50IG5leHQgcmVuZGVycy5cbiAgICAgKiBUaGUgcHJvbWlzZSByZXNvbHZlcyB0byBgdHJ1ZWAgaWYgdGhlIGVsZW1lbnQgcmVuZGVyZWQgYW5kIGBmYWxzZWAgaWYgdGhlXG4gICAgICogZWxlbWVudCBkaWQgbm90IHJlbmRlci5cbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCB3aGVuIHVzZXJzIChlLmcuIHRlc3RzKSBuZWVkIHRvIHJlYWN0IHRvIHRoZSByZW5kZXJlZCBzdGF0ZVxuICAgICAqIG9mIHRoZSBlbGVtZW50IGFmdGVyIGEgY2hhbmdlIGlzIG1hZGUuXG4gICAgICogVGhpcyBjYW4gYWxzbyBiZSB1c2VmdWwgaW4gZXZlbnQgaGFuZGxlcnMgaWYgaXQgaXMgZGVzaXJlYWJsZSB0byB3YWl0XG4gICAgICogdG8gc2VuZCBhbiBldmVudCB1bnRpbCBhZnRlciByZW5kZXJpbmcuIElmIHBvc3NpYmxlIGltcGxlbWVudCB0aGVcbiAgICAgKiBgX2RpZFJlbmRlcmAgbWV0aG9kIHRvIGRpcmVjdGx5IHJlc3BvbmQgdG8gcmVuZGVyaW5nIHdpdGhpbiB0aGVcbiAgICAgKiByZW5kZXJpbmcgbGlmZWN5Y2xlLlxuICAgICAqL1xuICAgIGdldCByZW5kZXJDb21wbGV0ZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9fcmVuZGVyQ29tcGxldGUpIHtcbiAgICAgICAgICAgIHRoaXMuX19yZW5kZXJDb21wbGV0ZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX3Jlc29sdmVSZW5kZXJDb21wbGV0ZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fcmVzb2x2ZVJlbmRlckNvbXBsZXRlID0gdGhpcy5fX3JlbmRlckNvbXBsZXRlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9faXNJbnZhbGlkICYmIHRoaXMuX19yZXNvbHZlUmVuZGVyQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuX19yZXNvbHZlUmVuZGVyQ29tcGxldGUoZmFsc2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fX3JlbmRlckNvbXBsZXRlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpdC1lbGVtZW50LmpzLm1hcCIsImltcG9ydCB7IGh0bWwsIExpdEVsZW1lbnQgfSBmcm9tICdAcG9seW1lci9saXQtZWxlbWVudCc7XG5cbmV4cG9ydCBjbGFzcyBBdG9tU3Bpbm5lciBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgZ2V0IGlzKCkgeyByZXR1cm4gJ2F0b20tc3Bpbm5lcic7IH1cblxuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiBTdHJpbmcsXG4gICAgICBkdXJhdGlvbjogTnVtYmVyLFxuICAgICAgc2l6ZTogTnVtYmVyLFxuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb2xvciA9ICcjZmYxZDVlJztcbiAgICB0aGlzLmR1cmF0aW9uID0gMTtcbiAgICB0aGlzLnNpemUgPSA2MDtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3R5bGU+XG4gICAgICAgICoge1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIH1cblxuICAgICAgICAuYXRvbS1zcGlubmVyIHtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLWF0b20tc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgICAgICB3aWR0aDogdmFyKC0tYXRvbS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hdG9tLXNwaW5uZXIgLnNwaW5uZXItaW5uZXIge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIH1cblxuICAgICAgICAuYXRvbS1zcGlubmVyIC5zcGlubmVyLWNpcmNsZSB7XG4gICAgICAgICAgY29sb3I6IHZhcigtLWF0b20tc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgZm9udC1zaXplOiBjYWxjKHZhcigtLWF0b20tc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjI0KTtcbiAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgIHRvcDogNTAlO1xuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmF0b20tc3Bpbm5lciAuc3Bpbm5lci1saW5lIHtcbiAgICAgICAgICBib3JkZXItbGVmdDogY2FsYyh2YXIoLS1hdG9tLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gMjUpIHNvbGlkIHZhcigtLWF0b20tc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIGJvcmRlci10b3A6IGNhbGModmFyKC0tYXRvbS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAvIDI1KSBzb2xpZCB0cmFuc3BhcmVudDtcbiAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICB9XG5cbiAgICAgICAgLmF0b20tc3Bpbm5lciAuc3Bpbm5lci1saW5lOm50aC1jaGlsZCgxKSB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBhdG9tLXNwaW5uZXItYW5pbWF0aW9uLTEgdmFyKC0tYXRvbS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgbGluZWFyIGluZmluaXRlO1xuICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlWigxMjBkZWcpIHJvdGF0ZVgoNjZkZWcpIHJvdGF0ZVooMGRlZyk7XG4gICAgICAgIH1cblxuICAgICAgICAuYXRvbS1zcGlubmVyIC5zcGlubmVyLWxpbmU6bnRoLWNoaWxkKDIpIHtcbiAgICAgICAgICBhbmltYXRpb246IGF0b20tc3Bpbm5lci1hbmltYXRpb24tMiB2YXIoLS1hdG9tLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBsaW5lYXIgaW5maW5pdGU7XG4gICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGVaKDI0MGRlZykgcm90YXRlWCg2NmRlZykgcm90YXRlWigwZGVnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5hdG9tLXNwaW5uZXIgLnNwaW5uZXItbGluZTpudGgtY2hpbGQoMykge1xuICAgICAgICAgIGFuaW1hdGlvbjogYXRvbS1zcGlubmVyLWFuaW1hdGlvbi0zIHZhcigtLWF0b20tc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGxpbmVhciBpbmZpbml0ZTtcbiAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKSByb3RhdGVYKDY2ZGVnKSByb3RhdGVaKDBkZWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBhdG9tLXNwaW5uZXItYW5pbWF0aW9uLTEge1xuICAgICAgICAgIDEwMCUge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGVaKDEyMGRlZykgcm90YXRlWCg2NmRlZykgcm90YXRlWigzNjBkZWcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgYXRvbS1zcGlubmVyLWFuaW1hdGlvbi0yIHtcbiAgICAgICAgICAxMDAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlWigyNDBkZWcpIHJvdGF0ZVgoNjZkZWcpIHJvdGF0ZVooMzYwZGVnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIGF0b20tc3Bpbm5lci1hbmltYXRpb24tMyB7XG4gICAgICAgICAgMTAwJSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKSByb3RhdGVYKDY2ZGVnKSByb3RhdGVaKDM2MGRlZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiYXRvbS1zcGlubmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLWlubmVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItbGluZVwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLWxpbmVcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1saW5lXCI+PC9kaXY+XG5cbiAgICAgICAgICA8IS0tQ2hyb21lIHJlbmRlcnMgbGl0dGxlIGNpcmNsZXMgbWFsZm9ybWVkIDooLS0+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItY2lyY2xlXCI+JiM5Njc5OzwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKEF0b21TcGlubmVyLmlzLCBBdG9tU3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgQnJlZWRpbmdSaG9tYnVzU3Bpbm5lciBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgZ2V0IGlzKCkgeyByZXR1cm4gJ2JyZWVkaW5nLXJob21idXMtc3Bpbm5lcic7IH1cblxuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiBTdHJpbmcsXG4gICAgICBkdXJhdGlvbjogTnVtYmVyLFxuICAgICAgc2l6ZTogTnVtYmVyLFxuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb2xvciA9ICcjZmYxZDVlJztcbiAgICB0aGlzLmR1cmF0aW9uID0gMjtcbiAgICB0aGlzLnNpemUgPSA2NTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3R5bGU+XG4gICAgICAgICoge1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIH1cblxuICAgICAgICAuYnJlZWRpbmctcmhvbWJ1cy1zcGlubmVyIHtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLWJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLWJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDQ1ZGVnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIsIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMge1xuICAgICAgICAgIGFuaW1hdGlvbi1kdXJhdGlvbjogdmFyKC0tYnJlZWRpbmctcmhvbWJ1cy1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cyk7XG4gICAgICAgICAgYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudDogaW5maW5pdGU7XG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYnJlZWRpbmctcmhvbWJ1cy1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tYnJlZWRpbmctcmhvbWJ1cy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAvIDcuNSk7XG4gICAgICAgICAgbGVmdDogY2FsYyh2YXIoLS1icmVlZGluZy1yaG9tYnVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gMi4zMDc3KTtcbiAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgdG9wOiBjYWxjKHZhcigtLWJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyAyLjMwNzcpO1xuICAgICAgICAgIHdpZHRoOiBjYWxjKHZhcigtLWJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA3LjUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmJyZWVkaW5nLXJob21idXMtc3Bpbm5lciAucmhvbWJ1czpudGgtY2hpbGQoMm4rMCkge1xuICAgICAgICAgIG1hcmdpbi1yaWdodDogMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuY2hpbGQtMSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDEwMG1zICogMSk7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuY2hpbGQtMiB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDEwMG1zICogMik7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtMjtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuY2hpbGQtMyB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDEwMG1zICogMyk7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtMztcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuY2hpbGQtNCB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDEwMG1zICogNCk7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtNDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuY2hpbGQtNSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDEwMG1zICogNSk7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtNTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuY2hpbGQtNiB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDEwMG1zICogNik7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtNjtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuY2hpbGQtNyB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDEwMG1zICogNyk7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtNztcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuY2hpbGQtOCB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDEwMG1zICogOCk7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtODtcbiAgICAgICAgfVxuXG4gICAgICAgIC5icmVlZGluZy1yaG9tYnVzLXNwaW5uZXIgLnJob21idXMuYmlnIHtcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuNXM7XG4gICAgICAgICAgYW5pbWF0aW9uOiBicmVlZGluZy1yaG9tYnVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLWJpZyB2YXIoLS1icmVlZGluZy1yaG9tYnVzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBpbmZpbml0ZTtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1icmVlZGluZy1yaG9tYnVzLXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pO1xuICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1icmVlZGluZy1yaG9tYnVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gMyk7XG4gICAgICAgICAgbGVmdDogY2FsYyh2YXIoLS1icmVlZGluZy1yaG9tYnVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gMyk7XG4gICAgICAgICAgdG9wOiBjYWxjKHZhcigtLWJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyAzKTtcbiAgICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS1icmVlZGluZy1yaG9tYnVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gMyk7XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtMSB7XG4gICAgICAgICAgNTAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0zMjUlLCAtMzI1JSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBicmVlZGluZy1yaG9tYnVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLTIge1xuICAgICAgICAgIDUwJSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAtMzI1JSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBicmVlZGluZy1yaG9tYnVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLTMge1xuICAgICAgICAgIDUwJSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgzMjUlLCAtMzI1JSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBicmVlZGluZy1yaG9tYnVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLTQge1xuICAgICAgICAgIDUwJSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgzMjUlLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIGJyZWVkaW5nLXJob21idXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtNSB7XG4gICAgICAgICAgNTAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDMyNSUsIDMyNSUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgYnJlZWRpbmctcmhvbWJ1cy1zcGlubmVyLWFuaW1hdGlvbi1jaGlsZC02IHtcbiAgICAgICAgICA1MCUge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMzI1JSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBicmVlZGluZy1yaG9tYnVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLTcge1xuICAgICAgICAgIDUwJSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMzI1JSwgMzI1JSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBicmVlZGluZy1yaG9tYnVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLTgge1xuICAgICAgICAgIDUwJSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMzI1JSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBicmVlZGluZy1yaG9tYnVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLWJpZyB7XG4gICAgICAgICAgNTAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMC41KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJicmVlZGluZy1yaG9tYnVzLXNwaW5uZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJob21idXMgY2hpbGQtMVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmhvbWJ1cyBjaGlsZC0yXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyaG9tYnVzIGNoaWxkLTNcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJob21idXMgY2hpbGQtNFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmhvbWJ1cyBjaGlsZC01XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyaG9tYnVzIGNoaWxkLTZcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJob21idXMgY2hpbGQtN1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmhvbWJ1cyBjaGlsZC04XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyaG9tYnVzIGJpZ1wiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoQnJlZWRpbmdSaG9tYnVzU3Bpbm5lci5pcywgQnJlZWRpbmdSaG9tYnVzU3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgQ2lyY2xlc1RvUmhvbWJ1c2VzU3Bpbm5lciBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgZ2V0IGlzKCkgeyByZXR1cm4gJ2NpcmNsZXMtdG8tcmhvbWJ1c2VzLXNwaW5uZXInOyB9XG5cbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2xvcjogU3RyaW5nLFxuICAgICAgZHVyYXRpb246IE51bWJlcixcbiAgICAgIG51bUNpcmNsZXM6IE51bWJlcixcbiAgICAgIHNpemU6IE51bWJlcixcbiAgICB9O1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29sb3IgPSAnI2ZmMWQ1ZSc7XG4gICAgdGhpcy5kdXJhdGlvbiA9IDEuMjtcbiAgICB0aGlzLm51bUNpcmNsZXMgPSAzO1xuICAgIHRoaXMuc2l6ZSA9IDE1O1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICBjb25zdCBjaXJjbGVTdHlsZXMgPSBbXTtcbiAgICBjb25zdCBjaXJjbGVzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMjsgaSA8PSB0aGlzLm51bUNpcmNsZXM7IGkrKykge1xuICAgICAgY2lyY2xlU3R5bGVzLnB1c2goaHRtbGBcbiAgICAgICAgLmNpcmNsZXMtdG8tcmhvbWJ1c2VzLXNwaW5uZXIgLmNpcmNsZTpudGgtY2hpbGQoJHtpfSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1jaXJjbGVzLXRvLXJob21idXNlcy1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyA4ICogJHtpfSk7XG4gICAgICAgIH1cbiAgICAgIGApO1xuXG4gICAgICBjaXJjbGVzLnB1c2goaHRtbGA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3R5bGU+XG4gICAgICAgICoge1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIH1cblxuICAgICAgICAuY2lyY2xlcy10by1yaG9tYnVzZXMtc3Bpbm5lciwgLmNpcmNsZXMtdG8tcmhvbWJ1c2VzLXNwaW5uZXIgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5jaXJjbGVzLXRvLXJob21idXNlcy1zcGlubmVyIHtcbiAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1jaXJjbGVzLXRvLXJob21idXNlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlclxuICAgICAgICAgIHdpZHRoOiBjYWxjKCh2YXIoLS1jaXJjbGVzLXRvLXJob21idXNlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSArIHZhcigtLWNpcmNsZXMtdG8tcmhvbWJ1c2VzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMS4xMjUpICogJHt0aGlzLm51bUNpcmNsZXN9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5jaXJjbGVzLXRvLXJob21idXNlcy1zcGlubmVyIC5jaXJjbGUge1xuICAgICAgICAgIGFuaW1hdGlvbjogY2lyY2xlcy10by1yaG9tYnVzZXMtYW5pbWF0aW9uIHZhcigtLWNpcmNsZXMtdG8tcmhvbWJ1c2VzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBsaW5lYXIgaW5maW5pdGU7XG4gICAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogMTAlO1xuICAgICAgICAgIGJvcmRlcjogM3B4IHNvbGlkIHZhcigtLWNpcmNsZXMtdG8tcmhvbWJ1c2VzLXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pO1xuICAgICAgICAgIGhlaWdodDogdmFyKC0tY2lyY2xlcy10by1yaG9tYnVzZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IGNhbGModmFyKC0tY2lyY2xlcy10by1yaG9tYnVzZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAxLjEyNSk7XG4gICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSg0NWRlZyk7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLWNpcmNsZXMtdG8tcmhvbWJ1c2VzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmNpcmNsZXMtdG8tcmhvbWJ1c2VzLXNwaW5uZXIgLmNpcmNsZTpudGgtY2hpbGQoMSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1jaXJjbGVzLXRvLXJob21idXNlcy1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyA4ICogMSk7XG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAke2NpcmNsZVN0eWxlc31cblxuICAgICAgICBAa2V5ZnJhbWVzIGNpcmNsZXMtdG8tcmhvbWJ1c2VzLWFuaW1hdGlvbiB7XG4gICAgICAgICAgMCUge1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTAlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAxNy41JSB7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMCU7XG4gICAgICAgICAgfVxuICAgICAgICAgIDUwJSB7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMDAlO1xuICAgICAgICAgIH1cbiAgICAgICAgICA5My41JSB7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMCU7XG4gICAgICAgICAgfVxuICAgICAgICAgIDEwMCUge1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTAlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgY2lyY2xlcy10by1yaG9tYnVzZXMtYmFja2dyb3VuZC1hbmltYXRpb24ge1xuICAgICAgICAgIDUwJSB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLjQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlcy10by1yaG9tYnVzZXMtc3Bpbm5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+XG4gICAgICAgICR7Y2lyY2xlc31cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKENpcmNsZXNUb1Job21idXNlc1NwaW5uZXIuaXMsIENpcmNsZXNUb1Job21idXNlc1NwaW5uZXIpO1xuIiwiaW1wb3J0IHsgaHRtbCwgTGl0RWxlbWVudCB9IGZyb20gJ0Bwb2x5bWVyL2xpdC1lbGVtZW50JztcblxuZXhwb3J0IGNsYXNzIEZpbmdlcnByaW50U3Bpbm5lciBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgZ2V0IGlzKCkgeyByZXR1cm4gJ2ZpbmdlcnByaW50LXNwaW5uZXInOyB9XG5cbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2xvcjogU3RyaW5nLFxuICAgICAgZHVyYXRpb246IE51bWJlcixcbiAgICAgIHNpemU6IE51bWJlcixcbiAgICB9O1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29sb3IgPSAnI2ZmMWQ1ZSc7XG4gICAgdGhpcy5kdXJhdGlvbiA9IDEuNTtcbiAgICB0aGlzLnNpemUgPSA2NDtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3R5bGU+XG4gICAgICAgICoge1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciB7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICAgIHBhZGRpbmc6IDJweDtcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmZpbmdlcnByaW50LXNwaW5uZXIgLnNwaW5uZXItcmluZyB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBmaW5nZXJwcmludC1zcGlubmVyLWFuaW1hdGlvbiB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgY3ViaWMtYmV6aWVyKDAuNjgwLCAtMC43NTAsIDAuMjY1LCAxLjc1MCkgaW5maW5pdGUgZm9yd2FyZHM7XG4gICAgICAgICAgYm9yZGVyLWJvdHRvbS1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgYm9yZGVyLWxlZnQtY29sb3I6IHRyYW5zcGFyZW50O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBib3JkZXItcmlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xuICAgICAgICAgIGJvcmRlci1zdHlsZTogc29saWQ7XG4gICAgICAgICAgYm9yZGVyLXRvcC1jb2xvcjogdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgYm9yZGVyLXdpZHRoOiAycHg7XG4gICAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgbWFyZ2luOiBhdXRvO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICByaWdodDogMDtcbiAgICAgICAgICB0b3A6IDA7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCgxKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiAxKTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgMCAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgMCAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCgyKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiAyKTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgMSAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgMSAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCgzKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiAzKTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgMiAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgMiAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCg0KSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiA0KTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgMyAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgMyAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCg1KSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiA1KTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgNCAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgNCAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCg2KSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiA2KTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgNSAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgNSAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCg3KSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiA3KTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgNiAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgNiAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCg4KSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiA4KTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgNyAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgNyAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICAuZmluZ2VycHJpbnQtc3Bpbm5lciAuc3Bpbm5lci1yaW5nOm50aC1jaGlsZCg5KSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKDUwbXMgKiA5KTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgOCAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA5ICsgOCAqIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gOSk7XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIGZpbmdlcnByaW50LXNwaW5uZXItYW5pbWF0aW9uIHtcbiAgICAgICAgICAxMDAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKCAzNjBkZWcgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaW5nZXJwcmludC1zcGlubmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLXJpbmdcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItcmluZ1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1yaW5nXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLXJpbmdcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItcmluZ1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1yaW5nXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcGlubmVyLXJpbmdcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItcmluZ1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1yaW5nXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShGaW5nZXJwcmludFNwaW5uZXIuaXMsIEZpbmdlcnByaW50U3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgRmxvd2VyU3Bpbm5lciBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgZ2V0IGlzKCkgeyByZXR1cm4gJ2Zsb3dlci1zcGlubmVyJzsgfVxuXG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IFN0cmluZyxcbiAgICAgIGR1cmF0aW9uOiBOdW1iZXIsXG4gICAgICBzaXplOiBOdW1iZXIsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmR1cmF0aW9uID0gMi41O1xuICAgIHRoaXMuY29sb3IgPSAnI2ZmMWQ1ZSc7XG4gICAgdGhpcy5zaXplID0gNzA7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIHJldHVybiBodG1sYFxuICAgICAgPHN0eWxlPlxuICAgICAgICAqIHtcbiAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICB9XG5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAgLmZsb3dlci1zcGlubmVyIHtcbiAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLWZsb3dlci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgICB3aWR0aDogdmFyKC0tZmxvd2VyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmZsb3dlci1zcGlubmVyIC5kb3RzLWNvbnRhaW5lciB7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLWZsb3dlci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAvIDcpO1xuICAgICAgICAgIHdpZHRoOiBjYWxjKHZhcigtLWZsb3dlci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAvIDcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmZsb3dlci1zcGlubmVyIC5zbWFsbGVyLWRvdCB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBmbG93ZXItc3Bpbm5lci1zbWFsbGVyLWRvdC1hbmltYXRpb24gdmFyKC0tZmxvd2VyLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAwcyBpbmZpbml0ZSBib3RoO1xuICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIH1cblxuICAgICAgICAuZmxvd2VyLXNwaW5uZXIgLmJpZ2dlci1kb3Qge1xuICAgICAgICAgIGFuaW1hdGlvbjogZmxvd2VyLXNwaW5uZXItYmlnZ2VyLWRvdC1hbmltYXRpb24gdmFyKC0tZmxvd2VyLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAwcyBpbmZpbml0ZSBib3RoO1xuICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgcGFkZGluZzogMTAlO1xuICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBmbG93ZXItc3Bpbm5lci1iaWdnZXItZG90LWFuaW1hdGlvbiB7XG4gICAgICAgICAgMCUsIDEwMCUge1xuICAgICAgICAgICAgYm94LXNoYWRvdzogdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweDtcbiAgICAgICAgICB9XG4gICAgICAgICAgNTAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDE4MGRlZyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIDI1JSwgNzUlIHtcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDI2cHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIC0yNnB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMjZweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggLTI2cHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMTlweCAtMTlweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAxOXB4IDE5cHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgLTE5cHggLTE5cHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgLTE5cHggMTlweCAwcHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIDEwMCUge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEBrZXlmcmFtZXMgZmxvd2VyLXNwaW5uZXItc21hbGxlci1kb3QtYW5pbWF0aW9uIHtcbiAgICAgICAgICAwJSwgMTAwJSB7XG4gICAgICAgICAgICBib3gtc2hhZG93OiB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4O1xuICAgICAgICAgIH1cbiAgICAgICAgICAyNSUsIDc1JSB7XG4gICAgICAgICAgICBib3gtc2hhZG93OiB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAxNHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAtMTRweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDE0cHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IC0xNHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDEwcHggLTEwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMTBweCAxMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIC0xMHB4IC0xMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIC0xMHB4IDEwcHggMHB4O1xuICAgICAgICAgIH1cbiAgICAgICAgICAxMDAlIHtcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIoLS1maW5nZXJwcmludC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KSAwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcigtLWZpbmdlcnByaW50LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pIDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyKC0tZmluZ2VycHJpbnQtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSkgMHB4IDBweCAwcHg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxvd2VyLXNwaW5uZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImRvdHMtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImJpZ2dlci1kb3RcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzbWFsbGVyLWRvdFwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKEZsb3dlclNwaW5uZXIuaXMsIEZsb3dlclNwaW5uZXIpO1xuIiwiaW1wb3J0IHsgaHRtbCwgTGl0RWxlbWVudCB9IGZyb20gJ0Bwb2x5bWVyL2xpdC1lbGVtZW50JztcblxuZXhwb3J0IGNsYXNzIEZ1bGZpbGxpbmdCb3VuY2luZ0NpcmNsZVNwaW5uZXIgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIGdldCBpcygpIHsgcmV0dXJuICdmdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyJzsgfVxuXG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IFN0cmluZyxcbiAgICAgIGR1cmF0aW9uOiBOdW1iZXIsXG4gICAgICBzaXplOiBOdW1iZXIsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbG9yID0gJyNmZjFkNWUnO1xuICAgIHRoaXMuZHVyYXRpb24gPSA0O1xuICAgIHRoaXMuc2l6ZSA9IDUwO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxzdHlsZT5cbiAgICAgICAgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIC5mdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyIHtcbiAgICAgICAgICBhbmltYXRpb246IGZ1bGZpbGxpbmctYm91bmNpbmctY2lyY2xlLXNwaW5uZXItYW5pbWF0aW9uIGluZmluaXRlIHZhcigtLWZ1bGZpbGxpbmctYm91bmNpbmctY2lyY2xlLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBlYXNlO1xuICAgICAgICAgIGhlaWdodDogdmFyKC0tZnVsZmlsbGluZy1ib3VuY2luZy1jaXJjbGUtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgIHdpZHRoOiB2YXIoLS1mdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5mdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyIC5vcmJpdCB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBmdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyLW9yYml0LWFuaW1hdGlvbiBpbmZpbml0ZSB2YXIoLS1mdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgZWFzZTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgYm9yZGVyOiBjYWxjKHZhcigtLWZ1bGZpbGxpbmctYm91bmNpbmctY2lyY2xlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC4wMykgc29saWQgdmFyKC0tZnVsZmlsbGluZy1ib3VuY2luZy1jaXJjbGUtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1mdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLWZ1bGZpbGxpbmctYm91bmNpbmctY2lyY2xlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmZ1bGZpbGxpbmctYm91bmNpbmctY2lyY2xlLXNwaW5uZXIgLmNpcmNsZSB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBmdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyLWNpcmNsZS1hbmltYXRpb24gaW5maW5pdGUgdmFyKC0tZnVsZmlsbGluZy1ib3VuY2luZy1jaXJjbGUtc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGVhc2U7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIGJvcmRlcjogY2FsYyh2YXIoLS1mdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMSkgc29saWQgdmFyKC0tZnVsZmlsbGluZy1ib3VuY2luZy1jaXJjbGUtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgY29sb3I6IHZhcigtLWZ1bGZpbGxpbmctYm91bmNpbmctY2lyY2xlLXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pO1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgIGhlaWdodDogdmFyKC0tZnVsZmlsbGluZy1ib3VuY2luZy1jaXJjbGUtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpIHNjYWxlKDEpO1xuICAgICAgICAgIHdpZHRoOiB2YXIoLS1mdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgZnVsZmlsbGluZy1ib3VuY2luZy1jaXJjbGUtc3Bpbm5lci1hbmltYXRpb24ge1xuICAgICAgICAgIDAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAxMDAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBmdWxmaWxsaW5nLWJvdW5jaW5nLWNpcmNsZS1zcGlubmVyLW9yYml0LWFuaW1hdGlvbiB7XG4gICAgICAgICAgMCUge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgNTAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIDYyLjUlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMC44KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgNzUlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIDg3LjUlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMC44KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgMTAwJSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgZnVsZmlsbGluZy1ib3VuY2luZy1jaXJjbGUtc3Bpbm5lci1jaXJjbGUtYW5pbWF0aW9uIHtcbiAgICAgICAgICAwJSB7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGJvcmRlci1sZWZ0LWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBib3JkZXItdG9wLWNvbG9yOiBpbmhlcml0O1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAxNi43JSB7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGJvcmRlci1sZWZ0LWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGJvcmRlci1yaWdodC1jb2xvcjogaW5pdGlhbDtcbiAgICAgICAgICAgIGJvcmRlci10b3AtY29sb3I6IGluaXRpYWw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgMzMuNCUge1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1jb2xvcjogaW5oZXJpdDtcbiAgICAgICAgICAgIGJvcmRlci1sZWZ0LWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGJvcmRlci1yaWdodC1jb2xvcjogaW5oZXJpdDtcbiAgICAgICAgICAgIGJvcmRlci10b3AtY29sb3I6IGluaGVyaXQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgNTAlIHtcbiAgICAgICAgICAgIGJvcmRlci1jb2xvcjogaW5oZXJpdDtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgNjIuNSUge1xuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiBpbmhlcml0O1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIDc1JSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IGluaGVyaXQ7XG4gICAgICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICA4Ny41JSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IGluaGVyaXQ7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuNCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgMTAwJSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1jb2xvcjogaW5oZXJpdDtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiZnVsZmlsbGluZy1ib3VuY2luZy1jaXJjbGUtc3Bpbm5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvcmJpdFwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoRnVsZmlsbGluZ0JvdW5jaW5nQ2lyY2xlU3Bpbm5lci5pcywgRnVsZmlsbGluZ0JvdW5jaW5nQ2lyY2xlU3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgRnVsZmlsbGluZ1NxdWFyZVNwaW5uZXIgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIGdldCBpcygpIHsgcmV0dXJuICdmdWxmaWxsaW5nLXNxdWFyZS1zcGlubmVyJzsgfVxuXG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IFN0cmluZyxcbiAgICAgIGR1cmF0aW9uOiBOdW1iZXIsXG4gICAgICBzaXplOiBOdW1iZXIsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbG9yID0gJyNmZjFkNWUnO1xuICAgIHRoaXMuZHVyYXRpb24gPSA0O1xuICAgIHRoaXMuc2l6ZSA9IDUwO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxzdHlsZT5cbiAgICAgICAgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgIC5mdWxmaWxsaW5nLXNxdWFyZS1zcGlubmVyIHtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLWZ1bGZpbGxpbmctc3F1YXJlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICAgIHdpZHRoOiB2YXIoLS1mdWxmaWxsaW5nLXNxdWFyZS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tZnVsZmlsbGluZy1zcXVhcmUtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgYW5pbWF0aW9uOiBmdWxmaWxsaW5nLXNxdWFyZS1zcGlubmVyLWFuaW1hdGlvbiB2YXIoLS1mdWxmaWxsaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgaW5maW5pdGUgZWFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5mdWxmaWxsaW5nLXNxdWFyZS1zcGlubmVyIC5zcGlubmVyLWlubmVyIHtcbiAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogdG9wO1xuICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1mdWxmaWxsaW5nLXNxdWFyZS1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICAgIGFuaW1hdGlvbjogZnVsZmlsbGluZy1zcXVhcmUtc3Bpbm5lci1pbm5lci1hbmltYXRpb24gdmFyKC0tZnVsZmlsbGluZy1zcXVhcmUtc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGluZmluaXRlIGVhc2UtaW47XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIGZ1bGZpbGxpbmctc3F1YXJlLXNwaW5uZXItYW5pbWF0aW9uIHtcbiAgICAgICAgICAwJSAgIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cbiAgICAgICAgICAyNSUgIHsgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKTsgfVxuICAgICAgICAgIDUwJSAgeyB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpOyB9XG4gICAgICAgICAgNzUlICB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cbiAgICAgICAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBmdWxmaWxsaW5nLXNxdWFyZS1zcGlubmVyLWlubmVyLWFuaW1hdGlvbiB7XG4gICAgICAgICAgMCUgICB7IGhlaWdodDogMCU7IH1cbiAgICAgICAgICAyNSUgIHsgaGVpZ2h0OiAwJTsgfVxuICAgICAgICAgIDUwJSAgeyBoZWlnaHQ6IDEwMCU7IH1cbiAgICAgICAgICA3NSUgIHsgaGVpZ2h0OiAxMDAlOyB9XG4gICAgICAgICAgMTAwJSB7IGhlaWdodDogMCU7IH1cbiAgICAgICAgfVxuICAgICAgPC9zdHlsZT5cblxuICAgICAgPGRpdiBjbGFzcz1cImZ1bGZpbGxpbmctc3F1YXJlLXNwaW5uZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNwaW5uZXItaW5uZXJcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKEZ1bGZpbGxpbmdTcXVhcmVTcGlubmVyLmlzLCBGdWxmaWxsaW5nU3F1YXJlU3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgSGFsZkNpcmNsZVNwaW5uZXIgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIGdldCBpcygpIHsgcmV0dXJuICdoYWxmLWNpcmNsZS1zcGlubmVyJzsgfVxuXG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IFN0cmluZyxcbiAgICAgIGR1cmF0aW9uOiBOdW1iZXIsXG4gICAgICBzaXplOiBOdW1iZXIsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmR1cmF0aW9uID0gMTtcbiAgICB0aGlzLmNvbG9yID0gJyNmZjFkNWUnO1xuICAgIHRoaXMuc2l6ZSA9IDYwO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxzdHlsZT5cbiAgICAgICAgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgLmhhbGYtY2lyY2xlLXNwaW5uZXIge1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1oYWxmLWNpcmNsZS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLWhhbGYtY2lyY2xlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmhhbGYtY2lyY2xlLXNwaW5uZXIgLmNpcmNsZSB7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogMTAwJTtcbiAgICAgICAgICBib3JkZXI6IGNhbGModmFyKC0taGFsZi1jaXJjbGUtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyAxMCkgc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgY29udGVudDogXCJcIjtcbiAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICB9XG5cbiAgICAgICAgLmhhbGYtY2lyY2xlLXNwaW5uZXIgLmNpcmNsZS5jaXJjbGUtMSB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBoYWxmLWNpcmNsZS1zcGlubmVyLWFuaW1hdGlvbiB2YXIoLS1oYWxmLWNpcmNsZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgaW5maW5pdGU7XG4gICAgICAgICAgYm9yZGVyLXRvcC1jb2xvcjogdmFyKC0taGFsZi1jaXJjbGUtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgIH1cblxuICAgICAgICAuaGFsZi1jaXJjbGUtc3Bpbm5lciAuY2lyY2xlLmNpcmNsZS0yIHtcbiAgICAgICAgICBhbmltYXRpb246IGhhbGYtY2lyY2xlLXNwaW5uZXItYW5pbWF0aW9uIHZhcigtLWhhbGYtY2lyY2xlLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBpbmZpbml0ZSBhbHRlcm5hdGU7XG4gICAgICAgICAgYm9yZGVyLWJvdHRvbS1jb2xvcjogdmFyKC0taGFsZi1jaXJjbGUtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIGhhbGYtY2lyY2xlLXNwaW5uZXItYW5pbWF0aW9uIHtcbiAgICAgICAgICAwJSAgIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cbiAgICAgICAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiaGFsZi1jaXJjbGUtc3Bpbm5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlIGNpcmNsZS0xXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGUgY2lyY2xlLTJcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKEhhbGZDaXJjbGVTcGlubmVyLmlzLCBIYWxmQ2lyY2xlU3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgSG9sbG93RG90c1NwaW5uZXIgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIGdldCBpcygpIHsgcmV0dXJuICdob2xsb3ctZG90cy1zcGlubmVyJzsgfVxuXG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZHVyYXRpb246IE51bWJlcixcbiAgICAgIGNvbG9yOiBTdHJpbmcsXG4gICAgICBudW1Eb3RzOiBOdW1iZXIsXG4gICAgICBzaXplOiBOdW1iZXIsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbG9yID0gJyNmZjFkNWUnO1xuICAgIHRoaXMuZHVyYXRpb24gPSAxO1xuICAgIHRoaXMubnVtRG90cyA9IDM7XG4gICAgdGhpcy5zaXplID0gMTU7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIGNvbnN0IGRvdFN0eWxlcyA9IFtdO1xuICAgIGNvbnN0IGRvdHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHRoaXMubnVtRG90czsgaSsrKSB7XG4gICAgICBkb3RTdHlsZXMucHVzaChodG1sYFxuICAgICAgICAuaG9sbG93LWRvdHMtc3Bpbm5lciAuZG90Om50aC1jaGlsZCgke2l9KSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKHZhcigtLWhvbGxvdy1kb3RzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAvICR7dGhpcy5udW1Eb3RzfSAqICR7aX0pO1xuICAgICAgICB9XG4gICAgICBgKTtcblxuICAgICAgZG90cy5wdXNoKGh0bWxgPGRpdiBjbGFzcz1cImRvdFwiPjwvZGl2PmApO1xuICAgIH1cblxuICAgIHJldHVybiBodG1sYFxuICAgICAgPHN0eWxlPlxuICAgICAgICAqIHtcbiAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICB9XG5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAuaG9sbG93LWRvdHMtc3Bpbm5lciB7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1ob2xsb3ctZG90cy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS1ob2xsb3ctZG90cy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDIgKiAke3RoaXMubnVtRG90c30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLmhvbGxvdy1kb3RzLXNwaW5uZXIgLmRvdCB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBob2xsb3ctZG90cy1zcGlubmVyLWFuaW1hdGlvbiB2YXIoLS1ob2xsb3ctZG90cy1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgZWFzZSBpbmZpbml0ZSAwbXM7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIGJvcmRlcjogY2FsYyh2YXIoLS1ob2xsb3ctZG90cy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAvIDUpIHNvbGlkIHZhcigtLWhvbGxvdy1kb3RzLXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pO1xuICAgICAgICAgIGZsb2F0OiBsZWZ0O1xuICAgICAgICAgIGhlaWdodDogdmFyKC0taG9sbG93LWRvdHMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgbWFyZ2luOiAwIGNhbGModmFyKC0taG9sbG93LWRvdHMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyAyKTtcbiAgICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xuICAgICAgICAgIHdpZHRoOiB2YXIoLS1ob2xsb3ctZG90cy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgICR7ZG90U3R5bGVzfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgaG9sbG93LWRvdHMtc3Bpbm5lci1hbmltYXRpb24ge1xuICAgICAgICAgIDUwJSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xuICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAxMDAlIHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiaG9sbG93LWRvdHMtc3Bpbm5lclwiPlxuICAgICAgICAke2RvdHN9XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShIb2xsb3dEb3RzU3Bpbm5lci5pcywgSG9sbG93RG90c1NwaW5uZXIpO1xuIiwiaW1wb3J0IHsgaHRtbCwgTGl0RWxlbWVudCB9IGZyb20gJ0Bwb2x5bWVyL2xpdC1lbGVtZW50JztcblxuZXhwb3J0IGNsYXNzIEludGVyc2VjdGluZ0NpcmNsZXNTcGlubmVyIGV4dGVuZHMgTGl0RWxlbWVudCB7XG4gIHN0YXRpYyBnZXQgaXMoKSB7IHJldHVybiAnaW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lcic7IH1cblxuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiBTdHJpbmcsXG4gICAgICBkdXJhdGlvbjogTnVtYmVyLFxuICAgICAgc2l6ZTogTnVtYmVyLFxuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb2xvciA9ICcjZmYxZDVlJztcbiAgICB0aGlzLmR1cmF0aW9uID0gMS4yO1xuICAgIHRoaXMuc2l6ZSA9IDM1O1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxzdHlsZT5cbiAgICAgICAgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgLmludGVyc2VjdGluZy1jaXJjbGVzLXNwaW5uZXIge1xuICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDIpO1xuICAgICAgICAgIHdpZHRoOiBjYWxjKHZhcigtLWludGVyc2VjdGluZy1jaXJjbGVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMik7XG4gICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgLmludGVyc2VjdGluZy1jaXJjbGVzLXNwaW5uZXIgLnNwaW5uZXJCbG9jayB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBpbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVycy1hbmltYXRpb24gdmFyKC0taW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGxpbmVhciBpbmZpbml0ZTtcbiAgICAgICAgICB0cmFuc2Zvcm0tb3JpZ2luOiBjZW50ZXI7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICB3aWR0aDogdmFyKC0taW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgIH1cblxuICAgICAgICAuaW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lciAuY2lyY2xlIHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyIC5jaXJjbGU6bnRoLWNoaWxkKDEpIHtcbiAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyIC5jaXJjbGU6bnRoLWNoaWxkKDIpIHtcbiAgICAgICAgICBsZWZ0OiBjYWxjKHZhcigtLWludGVyc2VjdGluZy1jaXJjbGVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogLTAuMzYpO1xuICAgICAgICAgIHRvcDogY2FsYyh2YXIoLS1pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMik7XG4gICAgICAgIH1cblxuICAgICAgICAuaW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lciAuY2lyY2xlOm50aC1jaGlsZCgzKSB7XG4gICAgICAgICAgbGVmdDogY2FsYyh2YXIoLS1pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIC0wLjM2KTtcbiAgICAgICAgICB0b3A6IGNhbGModmFyKC0taW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAtMC4yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyIC5jaXJjbGU6bnRoLWNoaWxkKDQpIHtcbiAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgIHRvcDogY2FsYyh2YXIoLS1pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIC0wLjM2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyIC5jaXJjbGU6bnRoLWNoaWxkKDUpIHtcbiAgICAgICAgICBsZWZ0OiBjYWxjKHZhcigtLWludGVyc2VjdGluZy1jaXJjbGVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC4zNik7XG4gICAgICAgICAgdG9wOiBjYWxjKHZhcigtLWludGVyc2VjdGluZy1jaXJjbGVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogLTAuMik7XG4gICAgICAgIH1cblxuICAgICAgICAuaW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lciAuY2lyY2xlOm50aC1jaGlsZCg2KSB7XG4gICAgICAgICAgbGVmdDogY2FsYyh2YXIoLS1pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMzYpO1xuICAgICAgICAgIHRvcDogY2FsYyh2YXIoLS1pbnRlcnNlY3RpbmctY2lyY2xlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMik7XG4gICAgICAgIH1cblxuICAgICAgICAuaW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lciAuY2lyY2xlOm50aC1jaGlsZCg3KSB7XG4gICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICB0b3A6IGNhbGModmFyKC0taW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjM2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgaW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lcnMtYW5pbWF0aW9uIHtcbiAgICAgICAgICBmcm9tIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cbiAgICAgICAgICB0byAgIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwiaW50ZXJzZWN0aW5nLWNpcmNsZXMtc3Bpbm5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lckJsb2NrXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIj48L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIj48L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoSW50ZXJzZWN0aW5nQ2lyY2xlc1NwaW5uZXIuaXMsIEludGVyc2VjdGluZ0NpcmNsZXNTcGlubmVyKTtcbiIsImltcG9ydCB7IGh0bWwsIExpdEVsZW1lbnQgfSBmcm9tICdAcG9seW1lci9saXQtZWxlbWVudCc7XG5cbmV4cG9ydCBjbGFzcyBMb29waW5nUmhvbWJ1c2VzU3Bpbm5lciBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgZ2V0IGlzKCkgeyByZXR1cm4gJ2xvb3BpbmctcmhvbWJ1c2VzLXNwaW5uZXInOyB9XG5cbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2xvcjogU3RyaW5nLFxuICAgICAgZHVyYXRpb246IE51bWJlcixcbiAgICAgIHNpemU6IE51bWJlcixcbiAgICB9O1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29sb3IgPSAnI2ZmMWQ1ZSc7XG4gICAgdGhpcy5kdXJhdGlvbiA9IDIuNTtcbiAgICB0aGlzLnNpemUgPSAxNTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3R5bGU+XG4gICAgICAgICoge1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIH1cblxuICAgICAgIC5sb29waW5nLXJob21idXNlcy1zcGlubmVyIHtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLWxvb3BpbmctcmhvbWJ1c2VzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS1sb29waW5nLXJob21idXNlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLmxvb3BpbmctcmhvbWJ1c2VzLXNwaW5uZXIgLnJob21idXMge1xuICAgICAgICAgIGFuaW1hdGlvbjogbG9vcGluZy1yaG9tYnVzZXMtc3Bpbm5lci1hbmltYXRpb24gdmFyKC0tbG9vcGluZy1yaG9tYnVzZXMtc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGxpbmVhciBpbmZpbml0ZTtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1sb29waW5nLXJob21idXNlcy1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiAycHg7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1sb29waW5nLXJob21idXNlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgICBsZWZ0OiBjYWxjKHZhcigtLWxvb3BpbmctcmhvbWJ1c2VzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogNCk7XG4gICAgICAgICAgbWFyZ2luOiAwIGF1dG87XG4gICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKSByb3RhdGUoNDVkZWcpIHNjYWxlKDApO1xuICAgICAgICAgIHdpZHRoOiB2YXIoLS1sb29waW5nLXJob21idXNlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5sb29waW5nLXJob21idXNlcy1zcGlubmVyIC5yaG9tYnVzOm50aC1jaGlsZCgxKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKHZhcigtLWxvb3BpbmctcmhvbWJ1c2VzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAqIDEgLyAtMS41KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5sb29waW5nLXJob21idXNlcy1zcGlubmVyIC5yaG9tYnVzOm50aC1jaGlsZCgyKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKHZhcigtLWxvb3BpbmctcmhvbWJ1c2VzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAqIDIgLyAtMS41KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5sb29waW5nLXJob21idXNlcy1zcGlubmVyIC5yaG9tYnVzOm50aC1jaGlsZCgzKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKHZhcigtLWxvb3BpbmctcmhvbWJ1c2VzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAqIDMgLyAtMS41KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgbG9vcGluZy1yaG9tYnVzZXMtc3Bpbm5lci1hbmltYXRpb24ge1xuICAgICAgICAgIDAlICAgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCkgICAgIHJvdGF0ZSg0NWRlZykgc2NhbGUoMCk7IH1cbiAgICAgICAgICA1MCUgIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yMzMlKSByb3RhdGUoNDVkZWcpIHNjYWxlKDEpOyB9XG4gICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNDY2JSkgcm90YXRlKDQ1ZGVnKSBzY2FsZSgwKTsgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwibG9vcGluZy1yaG9tYnVzZXMtc3Bpbm5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmhvbWJ1c1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmhvbWJ1c1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmhvbWJ1c1wiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoTG9vcGluZ1Job21idXNlc1NwaW5uZXIuaXMsIExvb3BpbmdSaG9tYnVzZXNTcGlubmVyKTtcbiIsImltcG9ydCB7IGh0bWwsIExpdEVsZW1lbnQgfSBmcm9tICdAcG9seW1lci9saXQtZWxlbWVudCc7XG5cbmV4cG9ydCBjbGFzcyBPcmJpdFNwaW5uZXIgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIGdldCBpcygpIHsgcmV0dXJuICdvcmJpdC1zcGlubmVyJzsgfVxuXG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IFN0cmluZyxcbiAgICAgIGR1cmF0aW9uOiBOdW1iZXIsXG4gICAgICBzaXplOiBOdW1iZXIsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbG9yID0gJyNmZjFkNWUnO1xuICAgIHRoaXMuZHVyYXRpb24gPSAxLjI7XG4gICAgdGhpcy5zaXplID0gNTU7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIHJldHVybiBodG1sYFxuICAgICAgPHN0eWxlPlxuICAgICAgICAqIHtcbiAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICB9XG5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAub3JiaXQtc3Bpbm5lciB7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIGhlaWdodDogdmFyKC0tb3JiaXQtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgcGVyc3BlY3RpdmU6IDgwMHB4O1xuICAgICAgICAgIHdpZHRoOiB2YXIoLS1vcmJpdC1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5vcmJpdC1zcGlubmVyIC5vcmJpdCB7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5vcmJpdC1zcGlubmVyIC5vcmJpdDpudGgtY2hpbGQoMSkge1xuICAgICAgICAgIGFuaW1hdGlvbjogb3JiaXQtc3Bpbm5lci1vcmJpdC1vbmUtYW5pbWF0aW9uIHZhcigtLW9yYml0LXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBsaW5lYXIgaW5maW5pdGU7XG4gICAgICAgICAgYm9yZGVyLWJvdHRvbTogM3B4IHNvbGlkIHZhcigtLW9yYml0LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pO1xuICAgICAgICAgIGxlZnQ6IDAlO1xuICAgICAgICAgIHRvcDogMCU7XG4gICAgICAgIH1cblxuICAgICAgICAub3JiaXQtc3Bpbm5lciAub3JiaXQ6bnRoLWNoaWxkKDIpIHtcbiAgICAgICAgICBhbmltYXRpb246IG9yYml0LXNwaW5uZXItb3JiaXQtdHdvLWFuaW1hdGlvbiB2YXIoLS1vcmJpdC1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgbGluZWFyIGluZmluaXRlO1xuICAgICAgICAgIGJvcmRlci1yaWdodDogM3B4IHNvbGlkIHZhcigtLW9yYml0LXNwaW5uZXItY29sb3IsICR7dGhpcy5jb2xvcn0pO1xuICAgICAgICAgIHJpZ2h0OiAwJTtcbiAgICAgICAgICB0b3A6IDAlO1xuICAgICAgICB9XG5cbiAgICAgICAgLm9yYml0LXNwaW5uZXIgLm9yYml0Om50aC1jaGlsZCgzKSB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBvcmJpdC1zcGlubmVyLW9yYml0LXRocmVlLWFuaW1hdGlvbiB2YXIoLS1vcmJpdC1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgbGluZWFyIGluZmluaXRlO1xuICAgICAgICAgIGJvcmRlci10b3A6IDNweCBzb2xpZCB2YXIoLS1vcmJpdC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBib3R0b206IDAlO1xuICAgICAgICAgIHJpZ2h0OiAwJTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgb3JiaXQtc3Bpbm5lci1vcmJpdC1vbmUtYW5pbWF0aW9uIHtcbiAgICAgICAgICAwJSAgIHsgdHJhbnNmb3JtOiByb3RhdGVYKDM1ZGVnKSByb3RhdGVZKC00NWRlZykgcm90YXRlWigwZGVnKTsgfVxuICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZVgoMzVkZWcpIHJvdGF0ZVkoLTQ1ZGVnKSByb3RhdGVaKDM2MGRlZyk7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgb3JiaXQtc3Bpbm5lci1vcmJpdC10d28tYW5pbWF0aW9uIHtcbiAgICAgICAgICAwJSAgIHsgdHJhbnNmb3JtOiByb3RhdGVYKDUwZGVnKSByb3RhdGVZKDEwZGVnKSByb3RhdGVaKDBkZWcpOyB9XG4gICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlWCg1MGRlZykgcm90YXRlWSgxMGRlZykgcm90YXRlWigzNjBkZWcpOyB9XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIG9yYml0LXNwaW5uZXItb3JiaXQtdGhyZWUtYW5pbWF0aW9uIHtcbiAgICAgICAgICAwJSAgIHsgdHJhbnNmb3JtOiByb3RhdGVYKDM1ZGVnKSByb3RhdGVZKDU1ZGVnKSByb3RhdGVaKDBkZWcpOyB9XG4gICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlWCgzNWRlZykgcm90YXRlWSg1NWRlZykgcm90YXRlWigzNjBkZWcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgPC9zdHlsZT5cblxuICAgICAgPGRpdiBjbGFzcz1cIm9yYml0LXNwaW5uZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9yYml0XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvcmJpdFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JiaXRcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKE9yYml0U3Bpbm5lci5pcywgT3JiaXRTcGlubmVyKTtcbiIsImltcG9ydCB7IGh0bWwsIExpdEVsZW1lbnQgfSBmcm9tICdAcG9seW1lci9saXQtZWxlbWVudCc7XG5cbmV4cG9ydCBjbGFzcyBQaXhlbFNwaW5uZXIgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIGdldCBpcygpIHsgcmV0dXJuICdwaXhlbC1zcGlubmVyJzsgfVxuXG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IFN0cmluZyxcbiAgICAgIGR1cmF0aW9uOiBOdW1iZXIsXG4gICAgICBzaXplOiBOdW1iZXIsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbG9yID0gJyNmZjFkNWUnO1xuICAgIHRoaXMuZHVyYXRpb24gPSAyO1xuICAgIHRoaXMuc2l6ZSA9IDcwO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxzdHlsZT5cbiAgICAgICAgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgLnBpeGVsLXNwaW5uZXIge1xuICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgICAgICAgIGhlaWdodDogdmFyKC0tcGl4ZWwtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLXBpeGVsLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnBpeGVsLXNwaW5uZXIgLnBpeGVsLXNwaW5uZXItaW5uZXIge1xuICAgICAgICAgIGFuaW1hdGlvbjogcGl4ZWwtc3Bpbm5lci1hbmltYXRpb24gdmFyKC0tcGl4ZWwtc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGxpbmVhciBpbmZpbml0ZTtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1waXhlbC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBib3gtc2hhZG93OiAxNXB4IDE1cHggIDAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAtMTVweCAtMTVweCAgMCAwLFxuICAgICAgICAgICAgICAgICAgICAgIDE1cHggLTE1cHggIDAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAtMTVweCAxNXB4ICAwIDAsXG4gICAgICAgICAgICAgICAgICAgICAgMCAxNXB4ICAwIDAsXG4gICAgICAgICAgICAgICAgICAgICAgMTVweCAwICAwIDAsXG4gICAgICAgICAgICAgICAgICAgICAgLTE1cHggMCAgMCAwLFxuICAgICAgICAgICAgICAgICAgICAgIDAgLTE1cHggMCAwO1xuICAgICAgICAgIGNvbG9yOiB2YXIoLS1waXhlbC1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tcGl4ZWwtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyA3KTtcbiAgICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS1waXhlbC1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAvIDcpO1xuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBwaXhlbC1zcGlubmVyLWFuaW1hdGlvbiB7XG4gICAgICAgICAgNTAlIHtcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IDIwcHggMjBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgLTIwcHggLTIwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDIwcHggLTIwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC0yMHB4IDIwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDBweCAxMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAxMHB4IDBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgLTEwcHggMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAwcHggLTEwcHggMHB4IDBweDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICA3NSUge1xuICAgICAgICAgICAgYm94LXNoYWRvdzogMjBweCAyMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAtMjBweCAtMjBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgMjBweCAtMjBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgLTIwcHggMjBweCAwcHggMHB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgMHB4IDEwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDEwcHggMHB4IDBweCAwcHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAtMTBweCAwcHggMHB4IDBweCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDBweCAtMTBweCAwcHggMHB4O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIDEwMCUge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJwaXhlbC1zcGlubmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJwaXhlbC1zcGlubmVyLWlubmVyXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShQaXhlbFNwaW5uZXIuaXMsIFBpeGVsU3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgUmFkYXJTcGlubmVyIGV4dGVuZHMgTGl0RWxlbWVudCB7XG4gIHN0YXRpYyBnZXQgaXMoKSB7IHJldHVybiAncmFkYXItc3Bpbm5lcic7IH1cblxuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiBTdHJpbmcsXG4gICAgICBkdXJhdGlvbjogTnVtYmVyLFxuICAgICAgc2l6ZTogTnVtYmVyLFxuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb2xvciA9ICcjZmYxZDVlJztcbiAgICB0aGlzLmR1cmF0aW9uID0gMjtcbiAgICB0aGlzLnNpemUgPSA2MDtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3R5bGU+XG4gICAgICAgICoge1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIH1cblxuICAgICAgIC5yYWRhci1zcGlubmVyIHtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLXJhZGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICB3aWR0aDogdmFyKC0tcmFkYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgIH1cblxuICAgICAgICAucmFkYXItc3Bpbm5lciAuY2lyY2xlIHtcbiAgICAgICAgICBhbmltYXRpb246IHJhZGFyLXNwaW5uZXItYW5pbWF0aW9uIHZhcigtLXJhZGFyLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBpbmZpbml0ZTtcbiAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICB9XG5cbiAgICAgICAgLnJhZGFyLXNwaW5uZXIgLmNpcmNsZTpudGgtY2hpbGQoMSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1yYWRhci1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyA2LjY3KTtcbiAgICAgICAgICBwYWRkaW5nOiBjYWxjKHZhcigtLXJhZGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogNSAqIDIgKiAwIC8gMTEwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5yYWRhci1zcGlubmVyIC5jaXJjbGU6bnRoLWNoaWxkKDIpIHtcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IGNhbGModmFyKC0tcmFkYXItc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIC8gNi42Nyk7XG4gICAgICAgICAgcGFkZGluZzogY2FsYyh2YXIoLS1yYWRhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDUgKiAyICogMSAvIDExMCk7XG4gICAgICAgIH1cblxuICAgICAgICAucmFkYXItc3Bpbm5lciAuY2lyY2xlOm50aC1jaGlsZCgzKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKHZhcigtLXJhZGFyLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAvIDYuNjcpO1xuICAgICAgICAgIHBhZGRpbmc6IGNhbGModmFyKC0tcmFkYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiA1ICogMiAqIDIgLyAxMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgLnJhZGFyLXNwaW5uZXIgLmNpcmNsZTpudGgtY2hpbGQoNCkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMG1zO1xuICAgICAgICAgIHBhZGRpbmc6IGNhbGModmFyKC0tcmFkYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiA1ICogMiAqIDMgLyAxMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgLnJhZGFyLXNwaW5uZXIgLmNpcmNsZS1pbm5lciwgLnJhZGFyLXNwaW5uZXIgLmNpcmNsZS1pbm5lci1jb250YWluZXIge1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBib3JkZXI6IGNhbGModmFyKC0tcmFkYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiA1IC8gMTEwKSBzb2xpZCB0cmFuc3BhcmVudDtcbiAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIH1cblxuICAgICAgICAucmFkYXItc3Bpbm5lciAuY2lyY2xlLWlubmVyIHtcbiAgICAgICAgICBib3JkZXItbGVmdC1jb2xvcjogdmFyKC0tcmFkYXItc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgYm9yZGVyLXJpZ2h0LWNvbG9yOiB2YXIoLS1yYWRhci1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgcmFkYXItc3Bpbm5lci1hbmltYXRpb24ge1xuICAgICAgICAgIDUwJSAgeyB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpOyB9XG4gICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJyYWRhci1zcGlubmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlLWlubmVyLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZS1pbm5lclwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZS1pbm5lci1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGUtaW5uZXJcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGUtaW5uZXItY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlLWlubmVyXCI+PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlLWlubmVyLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZS1pbm5lclwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFJhZGFyU3Bpbm5lci5pcywgUmFkYXJTcGlubmVyKTtcbiIsImltcG9ydCB7IGh0bWwsIExpdEVsZW1lbnQgfSBmcm9tICdAcG9seW1lci9saXQtZWxlbWVudCc7XG5cbmV4cG9ydCBjbGFzcyBTY2FsaW5nU3F1YXJlc1NwaW5uZXIgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIGdldCBpcygpIHsgcmV0dXJuICdzY2FsaW5nLXNxdWFyZXMtc3Bpbm5lcic7IH1cblxuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiBTdHJpbmcsXG4gICAgICBkdXJhdGlvbjogTnVtYmVyLFxuICAgICAgc2l6ZTogTnVtYmVyLFxuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb2xvciA9ICcjZmYxZDVlJztcbiAgICB0aGlzLmR1cmF0aW9uID0gMS4yNTtcbiAgICB0aGlzLnNpemUgPSA2NTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3R5bGU+XG4gICAgICAgICoge1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIH1cblxuICAgICAgIC5zY2FsaW5nLXNxdWFyZXMtc3Bpbm5lciB7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICBhbmltYXRpb246IHNjYWxpbmctc3F1YXJlcy1hbmltYXRpb24gdmFyKC0tc2NhbGluZy1zcXVhcmVzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBpbmZpbml0ZTtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1zY2FsaW5nLXNxdWFyZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgICAgIHdpZHRoOiB2YXIoLS1zY2FsaW5nLXNxdWFyZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgIH1cblxuICAgICAgICAuc2NhbGluZy1zcXVhcmVzLXNwaW5uZXIgLnNxdWFyZSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWR1cmF0aW9uOiB2YXIoLS1zY2FsaW5nLXNxdWFyZXMtc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpO1xuICAgICAgICAgIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlO1xuICAgICAgICAgIGJvcmRlcjogY2FsYyh2YXIoLS1zY2FsaW5nLXNxdWFyZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjA0IC8gMS4zKSBzb2xpZCB2YXIoLS1zY2FsaW5nLXNxdWFyZXMtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLXNjYWxpbmctc3F1YXJlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMjUgLyAxLjMpO1xuICAgICAgICAgIG1hcmdpbi1sZWZ0OiBhdXRvO1xuICAgICAgICAgIG1hcmdpbi1yaWdodDogYXV0bztcbiAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tc2NhbGluZy1zcXVhcmVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC4yNSAvIDEuMyk7XG4gICAgICAgIH1cblxuICAgICAgICAuc2NhbGluZy1zcXVhcmVzLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoMSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBzY2FsaW5nLXNxdWFyZXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5zY2FsaW5nLXNxdWFyZXMtc3Bpbm5lciAuc3F1YXJlOm50aC1jaGlsZCgyKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IHNjYWxpbmctc3F1YXJlcy1zcGlubmVyLWFuaW1hdGlvbi1jaGlsZC0yO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNjYWxpbmctc3F1YXJlcy1zcGlubmVyIC5zcXVhcmU6bnRoLWNoaWxkKDMpIHtcbiAgICAgICAgICBhbmltYXRpb24tbmFtZTogc2NhbGluZy1zcXVhcmVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLTM7XG4gICAgICAgIH1cblxuICAgICAgICAuc2NhbGluZy1zcXVhcmVzLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoNCkge1xuICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBzY2FsaW5nLXNxdWFyZXMtc3Bpbm5lci1hbmltYXRpb24tY2hpbGQtNDtcbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgc2NhbGluZy1zcXVhcmVzLWFuaW1hdGlvbiB7XG4gICAgICAgICAgNTAlICB7IHRyYW5zZm9ybTogcm90YXRlKDkwZGVnKTsgfVxuICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpOyB9XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIHNjYWxpbmctc3F1YXJlcy1zcGlubmVyLWFuaW1hdGlvbi1jaGlsZC0xIHtcbiAgICAgICAgICA1MCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgxNTAlLDE1MCUpIHNjYWxlKDIsMik7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgc2NhbGluZy1zcXVhcmVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLTIge1xuICAgICAgICAgIDUwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC0xNTAlLDE1MCUpIHNjYWxlKDIsMik7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgc2NhbGluZy1zcXVhcmVzLXNwaW5uZXItYW5pbWF0aW9uLWNoaWxkLTMge1xuICAgICAgICAgIDUwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC0xNTAlLC0xNTAlKSBzY2FsZSgyLDIpOyB9XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIHNjYWxpbmctc3F1YXJlcy1zcGlubmVyLWFuaW1hdGlvbi1jaGlsZC00IHtcbiAgICAgICAgICA1MCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgxNTAlLC0xNTAlKSBzY2FsZSgyLDIpOyB9XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJzY2FsaW5nLXNxdWFyZXMtc3Bpbm5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3F1YXJlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcXVhcmVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNxdWFyZVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3F1YXJlXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShTY2FsaW5nU3F1YXJlc1NwaW5uZXIuaXMsIFNjYWxpbmdTcXVhcmVzU3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgU2VsZkJ1aWxkaW5nU3F1YXJlU3Bpbm5lciBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgZ2V0IGlzKCkgeyByZXR1cm4gJ3NlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXInOyB9XG5cbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2xvcjogU3RyaW5nLFxuICAgICAgZHVyYXRpb246IE51bWJlcixcbiAgICAgIHNpemU6IE51bWJlcixcbiAgICB9O1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29sb3IgPSAnI2ZmMWQ1ZSc7XG4gICAgdGhpcy5kdXJhdGlvbiA9IDY7XG4gICAgdGhpcy5zaXplID0gMTA7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIHJldHVybiBodG1sYFxuICAgICAgPHN0eWxlPlxuICAgICAgICAqIHtcbiAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICB9XG5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAuc2VsZi1idWlsZGluZy1zcXVhcmUtc3Bpbm5lciB7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLXNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogNCk7XG4gICAgICAgICAgdG9wOiBjYWxjKHZhcigtLXNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMiAvIDMpO1xuICAgICAgICAgIHdpZHRoOiBjYWxjKHZhcigtLXNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogNCk7XG4gICAgICAgIH1cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZSB7XG4gICAgICAgICAgYW5pbWF0aW9uOiBzZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyIHZhcigtLXNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBpbmZpbml0ZTtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBmbG9hdDogbGVmdDtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLXNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICAgIG1hcmdpbi1yaWdodDogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAvIDMpO1xuICAgICAgICAgIG1hcmdpbi10b3A6IGNhbGModmFyKC0tc2VsZi1idWlsZGluZy1zcXVhcmUtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyAzKTtcbiAgICAgICAgICBvcGFjaXR5OiAwO1xuICAgICAgICAgIHBvc2l0aW9uOnJlbGF0aXZlO1xuICAgICAgICAgIHRvcDogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIC0yIC8gMyk7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLXNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoMSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoMikge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoMykge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoNCkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoNSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoNikge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoNykge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoOCkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoOSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyMCAqIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbGYtYnVpbGRpbmctc3F1YXJlLXNwaW5uZXIgLmNsZWFyIHtcbiAgICAgICAgICBjbGVhcjogYm90aDtcbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgc2VsZi1idWlsZGluZy1zcXVhcmUtc3Bpbm5lciB7XG4gICAgICAgICAgMCUge1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICA1JSB7XG4gICAgICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIDUwLjklIHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgNTUuOSUge1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgIHRvcDogaW5oZXJpdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWxmLWJ1aWxkaW5nLXNxdWFyZS1zcGlubmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcXVhcmVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNxdWFyZVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3F1YXJlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcXVhcmUgY2xlYXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNxdWFyZVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3F1YXJlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcXVhcmUgY2xlYXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNxdWFyZVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3F1YXJlXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShTZWxmQnVpbGRpbmdTcXVhcmVTcGlubmVyLmlzLCBTZWxmQnVpbGRpbmdTcXVhcmVTcGlubmVyKTtcbiIsImltcG9ydCB7IGh0bWwsIExpdEVsZW1lbnQgfSBmcm9tICdAcG9seW1lci9saXQtZWxlbWVudCc7XG5cbmV4cG9ydCBjbGFzcyBTZW1pcG9sYXJTcGlubmVyIGV4dGVuZHMgTGl0RWxlbWVudCB7XG4gIHN0YXRpYyBnZXQgaXMoKSB7IHJldHVybiAnc2VtaXBvbGFyLXNwaW5uZXInOyB9XG5cbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2xvcjogU3RyaW5nLFxuICAgICAgZHVyYXRpb246IE51bWJlcixcbiAgICAgIHNpemU6IE51bWJlcixcbiAgICB9O1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29sb3IgPSAnI2ZmMWQ1ZSc7XG4gICAgdGhpcy5kdXJhdGlvbiA9IDI7XG4gICAgdGhpcy5zaXplID0gNjU7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIHJldHVybiBodG1sYFxuICAgICAgPHN0eWxlPlxuICAgICAgICAqIHtcbiAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICB9XG5cbiAgICAgICAgOmhvc3Qge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICB9XG5cbiAgICAgICAuc2VtaXBvbGFyLXNwaW5uZXIge1xuICAgICAgICAgIGhlaWdodDogdmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICB3aWR0aDogdmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbWlwb2xhci1zcGlubmVyIC5yaW5nIHtcbiAgICAgICAgICBhbmltYXRpb246IHNlbWlwb2xhci1zcGlubmVyLWFuaW1hdGlvbiB2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGluZmluaXRlO1xuICAgICAgICAgIGJvcmRlci1ib3R0b20tY29sb3I6IHRyYW5zcGFyZW50O1xuICAgICAgICAgIGJvcmRlci1sZWZ0LWNvbG9yOiB2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICAgICAgICBib3JkZXItdG9wLWNvbG9yOiB2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgYm9yZGVyLXdpZHRoOiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMDUpO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5zZW1pcG9sYXItc3Bpbm5lciAucmluZzpudGgtY2hpbGQoMSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpICogMC4xICogNCk7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAtIHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMiAqIDApO1xuICAgICAgICAgIGxlZnQ6IGNhbGModmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC4xICogMCk7XG4gICAgICAgICAgdG9wOiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMSAqIDApO1xuICAgICAgICAgIHdpZHRoOiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAtIHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMiAqIDApO1xuICAgICAgICAgIHotaW5kZXg6IDU7XG4gICAgICAgIH1cblxuICAgICAgICAuc2VtaXBvbGFyLXNwaW5uZXIgLnJpbmc6bnRoLWNoaWxkKDIpIHtcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IGNhbGModmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAqIDAuMSAqIDMpO1xuICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLSB2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjIgKiAxKTtcbiAgICAgICAgICBsZWZ0OiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMSAqIDEpO1xuICAgICAgICAgIHRvcDogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjEgKiAxKTtcbiAgICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLSB2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjIgKiAxKTtcbiAgICAgICAgICB6LWluZGV4OiA0O1xuICAgICAgICB9XG5cbiAgICAgICAgLnNlbWlwb2xhci1zcGlubmVyIC5yaW5nOm50aC1jaGlsZCgzKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgKiAwLjEgKiAyKTtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC0gdmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC4yICogMik7XG4gICAgICAgICAgbGVmdDogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjEgKiAyKTtcbiAgICAgICAgICB0b3A6IGNhbGModmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC4xICogMik7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC0gdmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC4yICogMik7XG4gICAgICAgICAgei1pbmRleDogMztcbiAgICAgICAgfVxuXG4gICAgICAgIC5zZW1pcG9sYXItc3Bpbm5lciAucmluZzpudGgtY2hpbGQoNCkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpICogMC4xICogMSk7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAtIHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMiAqIDMpO1xuICAgICAgICAgIGxlZnQ6IGNhbGModmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC4xICogMyk7XG4gICAgICAgICAgdG9wOiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMSAqIDMpO1xuICAgICAgICAgIHdpZHRoOiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAtIHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMiAqIDMpO1xuICAgICAgICAgIHotaW5kZXg6IDI7XG4gICAgICAgIH1cblxuICAgICAgICAuc2VtaXBvbGFyLXNwaW5uZXIgLnJpbmc6bnRoLWNoaWxkKDUpIHtcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IGNhbGModmFyKC0tc2VtaXBvbGFyLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAqIDAuMSAqIDApO1xuICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLSB2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjIgKiA0KTtcbiAgICAgICAgICBsZWZ0OiBjYWxjKHZhcigtLXNlbWlwb2xhci1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMSAqIDQpO1xuICAgICAgICAgIHRvcDogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjEgKiA0KTtcbiAgICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLSB2YXIoLS1zZW1pcG9sYXItc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjIgKiA0KTtcbiAgICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBzZW1pcG9sYXItc3Bpbm5lci1hbmltYXRpb24ge1xuICAgICAgICAgIDUwJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZykgc2NhbGUoMC43KTsgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwic2VtaXBvbGFyLXNwaW5uZXJcIiA6c3R5bGU9XCJzcGlubmVyU3R5bGVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpbmdcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpbmdcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpbmdcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpbmdcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInJpbmdcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFNlbWlwb2xhclNwaW5uZXIuaXMsIFNlbWlwb2xhclNwaW5uZXIpO1xuIiwiaW1wb3J0IHsgaHRtbCwgTGl0RWxlbWVudCB9IGZyb20gJ0Bwb2x5bWVyL2xpdC1lbGVtZW50JztcblxuZXhwb3J0IGNsYXNzIFNwcmluZ1NwaW5uZXIgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIGdldCBpcygpIHsgcmV0dXJuICdzcHJpbmctc3Bpbm5lcic7IH1cblxuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiBTdHJpbmcsXG4gICAgICBkdXJhdGlvbjogTnVtYmVyLFxuICAgICAgc2l6ZTogTnVtYmVyLFxuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb2xvciA9ICcjZmYxZDVlJztcbiAgICB0aGlzLmR1cmF0aW9uID0gMztcbiAgICB0aGlzLnNpemUgPSA2MDtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c3R5bGU+XG4gICAgICAgICoge1xuICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgIH1cblxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIH1cblxuICAgICAgIC5zcHJpbmctc3Bpbm5lciB7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1zcHJpbmctc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLXNwcmluZy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5zcHJpbmctc3Bpbm5lciAuc3ByaW5nLXNwaW5uZXItcGFydCB7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLXNwcmluZy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAvIDIpO1xuICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICAgICAgd2lkdGg6IHZhcigtLXNwcmluZy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5zcHJpbmctc3Bpbm5lciAgLnNwcmluZy1zcGlubmVyLXBhcnQuYm90dG9tIHtcbiAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKSBzY2FsZSgtMSwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICAuc3ByaW5nLXNwaW5uZXIgLnNwcmluZy1zcGlubmVyLXJvdGF0b3Ige1xuICAgICAgICAgIGFuaW1hdGlvbjogc3ByaW5nLXNwaW5uZXItYW5pbWF0aW9uIHZhcigtLXNwcmluZy1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgZWFzZS1pbi1vdXQgaW5maW5pdGU7XG4gICAgICAgICAgYm9yZGVyLWJvdHRvbS1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgYm9yZGVyLWxlZnQtY29sb3I6IHRyYW5zcGFyZW50O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICBib3JkZXItcmlnaHQtY29sb3I6IHZhcigtLXNwcmluZy1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICAgICAgICAgIGJvcmRlci10b3AtY29sb3I6IHZhcigtLXNwcmluZy1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBib3JkZXItd2lkdGg6IGNhbGModmFyKC0tc3ByaW5nLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gNyk7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1zcHJpbmctc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoLTIwMGRlZyk7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLXNwcmluZy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgc3ByaW5nLXNwaW5uZXItYW5pbWF0aW9uIHtcbiAgICAgICAgICAwJSB7XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6IGNhbGModmFyKC0tc3ByaW5nLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gNyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgMjUlIHtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogY2FsYyh2YXIoLS1zcHJpbmctc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyAyMy4zMyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgNTAlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDExNWRlZyk7XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6IGNhbGModmFyKC0tc3ByaW5nLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gNyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgNzUlIHtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogY2FsYyh2YXIoLS1zcHJpbmctc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgLyAyMy4zMyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgMTAwJSB7XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6IGNhbGModmFyKC0tc3ByaW5nLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpIC8gNyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICA8L3N0eWxlPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwic3ByaW5nLXNwaW5uZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNwcmluZy1zcGlubmVyLXBhcnQgdG9wXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNwcmluZy1zcGlubmVyLXJvdGF0b3JcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNwcmluZy1zcGlubmVyLXBhcnQgYm90dG9tXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNwcmluZy1zcGlubmVyLXJvdGF0b3JcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShTcHJpbmdTcGlubmVyLmlzLCBTcHJpbmdTcGlubmVyKTtcbiIsImltcG9ydCB7IGh0bWwsIExpdEVsZW1lbnQgfSBmcm9tICdAcG9seW1lci9saXQtZWxlbWVudCc7XG5cbmV4cG9ydCBjbGFzcyBTd2FwcGluZ1NxdWFyZXNTcGlubmVyIGV4dGVuZHMgTGl0RWxlbWVudCB7XG4gIHN0YXRpYyBnZXQgaXMoKSB7IHJldHVybiAnc3dhcHBpbmctc3F1YXJlcy1zcGlubmVyJzsgfVxuXG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sb3I6IFN0cmluZyxcbiAgICAgIGR1cmF0aW9uOiBOdW1iZXIsXG4gICAgICBzaXplOiBOdW1iZXIsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbG9yID0gJyNmZjFkNWUnO1xuICAgIHRoaXMuZHVyYXRpb24gPSAxO1xuICAgIHRoaXMuc2l6ZSA9IDY1O1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxzdHlsZT5cbiAgICAgICAgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgLnN3YXBwaW5nLXNxdWFyZXMtc3Bpbm5lciB7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgICAgICAgaGVpZ2h0OiB2YXIoLS1zd2FwcGluZy1zcXVhcmVzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpO1xuICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICB3aWR0aDogdmFyKC0tc3dhcHBpbmctc3F1YXJlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5zd2FwcGluZy1zcXVhcmVzLXNwaW5uZXIgLnNxdWFyZSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWR1cmF0aW9uOiB2YXIoLS1zd2FwcGluZy1zcXVhcmVzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKTtcbiAgICAgICAgICBhbmltYXRpb24taXRlcmF0aW9uLWNvdW50OiBpbmZpbml0ZTtcbiAgICAgICAgICBib3JkZXI6IGNhbGModmFyKC0tc3dhcHBpbmctc3F1YXJlcy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMDQgLyAxLjMpIHNvbGlkIHZhcigtLXN3YXBwaW5nLXNxdWFyZXMtc3Bpbm5lci1jb2xvciwgJHt0aGlzLmNvbG9yfSk7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLXN3YXBwaW5nLXNxdWFyZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjI1IC8gMS4zKTtcbiAgICAgICAgICBtYXJnaW4tbGVmdDogYXV0bztcbiAgICAgICAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XG4gICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgIHdpZHRoOiBjYWxjKHZhcigtLXN3YXBwaW5nLXNxdWFyZXMtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjI1IC8gMS4zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5zd2FwcGluZy1zcXVhcmVzLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoMSkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogY2FsYyh2YXIoLS1zd2FwcGluZy1zcXVhcmVzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSAvIDIpO1xuICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBzd2FwcGluZy1zcXVhcmVzLWFuaW1hdGlvbi1jaGlsZC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgLnN3YXBwaW5nLXNxdWFyZXMtc3Bpbm5lciAuc3F1YXJlOm50aC1jaGlsZCgyKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwbXM7XG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IHN3YXBwaW5nLXNxdWFyZXMtYW5pbWF0aW9uLWNoaWxkLTI7XG4gICAgICAgIH1cblxuICAgICAgICAuc3dhcHBpbmctc3F1YXJlcy1zcGlubmVyIC5zcXVhcmU6bnRoLWNoaWxkKDMpIHtcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IGNhbGModmFyKC0tc3dhcHBpbmctc3F1YXJlcy1zcGlubmVyLWR1cmF0aW9uLCAke3RoaXMuZHVyYXRpb259cykgLyAyKTtcbiAgICAgICAgICBhbmltYXRpb24tbmFtZTogc3dhcHBpbmctc3F1YXJlcy1hbmltYXRpb24tY2hpbGQtMztcbiAgICAgICAgfVxuXG4gICAgICAgIC5zd2FwcGluZy1zcXVhcmVzLXNwaW5uZXIgLnNxdWFyZTpudGgtY2hpbGQoNCkge1xuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMG1zO1xuICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBzd2FwcGluZy1zcXVhcmVzLWFuaW1hdGlvbi1jaGlsZC00O1xuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBzd2FwcGluZy1zcXVhcmVzLWFuaW1hdGlvbi1jaGlsZC0xIHtcbiAgICAgICAgICA1MCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgxNTAlLDE1MCUpIHNjYWxlKDIsMik7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgc3dhcHBpbmctc3F1YXJlcy1hbmltYXRpb24tY2hpbGQtMiB7XG4gICAgICAgICAgNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTE1MCUsMTUwJSkgc2NhbGUoMiwyKTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBzd2FwcGluZy1zcXVhcmVzLWFuaW1hdGlvbi1jaGlsZC0zIHtcbiAgICAgICAgICA1MCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMTUwJSwtMTUwJSkgc2NhbGUoMiwyKTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyBzd2FwcGluZy1zcXVhcmVzLWFuaW1hdGlvbi1jaGlsZC00IHtcbiAgICAgICAgICA1MCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgxNTAlLC0xNTAlKSBzY2FsZSgyLDIpOyB9XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJzd2FwcGluZy1zcXVhcmVzLXNwaW5uZXJcIiA6c3R5bGU9XCJzcGlubmVyU3R5bGVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNxdWFyZVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic3F1YXJlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcXVhcmVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNxdWFyZVwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoU3dhcHBpbmdTcXVhcmVzU3Bpbm5lci5pcywgU3dhcHBpbmdTcXVhcmVzU3Bpbm5lcik7XG4iLCJpbXBvcnQgeyBodG1sLCBMaXRFbGVtZW50IH0gZnJvbSAnQHBvbHltZXIvbGl0LWVsZW1lbnQnO1xuXG5leHBvcnQgY2xhc3MgVHJpbml0eVJpbmdzU3Bpbm5lciBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgZ2V0IGlzKCkgeyByZXR1cm4gJ3RyaW5pdHktcmluZ3Mtc3Bpbm5lcic7IH1cblxuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbG9yOiBTdHJpbmcsXG4gICAgICBkdXJhdGlvbjogTnVtYmVyLFxuICAgICAgc2l6ZTogTnVtYmVyLFxuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb2xvciA9ICcjZmYxZDVlJztcbiAgICB0aGlzLmR1cmF0aW9uID0gMS41O1xuICAgIHRoaXMuc2l6ZSA9IDYwO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxzdHlsZT5cbiAgICAgICAgKiB7XG4gICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgfVxuXG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuXG4gICAgICAgLnRyaW5pdHktcmluZ3Mtc3Bpbm5lciB7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLXRyaW5pdHktcmluZ3Mtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAyKTtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICAgIHBhZGRpbmc6IDNweDtcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tdHJpbml0eS1yaW5ncy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnRyaW5pdHktcmluZ3Mtc3Bpbm5lciAuY2lyY2xlIHtcbiAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgYm9yZGVyOiAzcHggc29saWQgdmFyKC0tdHJpbml0eS1yaW5ncy1zcGlubmVyLWNvbG9yLCAke3RoaXMuY29sb3J9KTtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC50cmluaXR5LXJpbmdzLXNwaW5uZXIgLmNpcmNsZTpudGgtY2hpbGQoMSkge1xuICAgICAgICAgIGFuaW1hdGlvbjogdHJpbml0eS1yaW5ncy1zcGlubmVyLWNpcmNsZTEtYW5pbWF0aW9uIHZhcigtLXRyaW5pdHktcmluZ3Mtc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGluZmluaXRlIGxpbmVhcjtcbiAgICAgICAgICBib3JkZXItd2lkdGg6IDNweDtcbiAgICAgICAgICBoZWlnaHQ6IHZhcigtLXRyaW5pdHktcmluZ3Mtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgICAgd2lkdGg6IHZhcigtLXRyaW5pdHktcmluZ3Mtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCk7XG4gICAgICAgIH1cblxuICAgICAgICAudHJpbml0eS1yaW5ncy1zcGlubmVyIC5jaXJjbGU6bnRoLWNoaWxkKDIpIHtcbiAgICAgICAgICBhbmltYXRpb246IHRyaW5pdHktcmluZ3Mtc3Bpbm5lci1jaXJjbGUyLWFuaW1hdGlvbiB2YXIoLS10cmluaXR5LXJpbmdzLXNwaW5uZXItZHVyYXRpb24sICR7dGhpcy5kdXJhdGlvbn1zKSBpbmZpbml0ZSBsaW5lYXI7XG4gICAgICAgICAgYm9yZGVyLXdpZHRoOiAycHg7XG4gICAgICAgICAgaGVpZ2h0OiBjYWxjKHZhcigtLXRyaW5pdHktcmluZ3Mtc3Bpbm5lci1zaXplLCAke3RoaXMuc2l6ZX1weCkgKiAwLjY1KTtcbiAgICAgICAgICB3aWR0aDogY2FsYyh2YXIoLS10cmluaXR5LXJpbmdzLXNwaW5uZXItc2l6ZSwgJHt0aGlzLnNpemV9cHgpICogMC42NSk7XG4gICAgICAgIH1cblxuICAgICAgICAudHJpbml0eS1yaW5ncy1zcGlubmVyIC5jaXJjbGU6bnRoLWNoaWxkKDMpIHtcbiAgICAgICAgICBhbmltYXRpb246dHJpbml0eS1yaW5ncy1zcGlubmVyLWNpcmNsZTMtYW5pbWF0aW9uIHZhcigtLXRyaW5pdHktcmluZ3Mtc3Bpbm5lci1kdXJhdGlvbiwgJHt0aGlzLmR1cmF0aW9ufXMpIGluZmluaXRlIGxpbmVhcjtcbiAgICAgICAgICBib3JkZXItd2lkdGg6IDFweDtcbiAgICAgICAgICBoZWlnaHQ6IGNhbGModmFyKC0tdHJpbml0eS1yaW5ncy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMSk7XG4gICAgICAgICAgd2lkdGg6IGNhbGModmFyKC0tdHJpbml0eS1yaW5ncy1zcGlubmVyLXNpemUsICR7dGhpcy5zaXplfXB4KSAqIDAuMSk7XG4gICAgICAgIH1cblxuICAgICAgICBAa2V5ZnJhbWVzIHRyaW5pdHktcmluZ3Mtc3Bpbm5lci1jaXJjbGUxLWFuaW1hdGlvbntcbiAgICAgICAgICAwJSAgIHsgdHJhbnNmb3JtOiByb3RhdGVaKDIwZGVnKSAgcm90YXRlWSgwZGVnKTsgfVxuICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZVooMTAwZGVnKSByb3RhdGVZKDM2MGRlZyk7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIEBrZXlmcmFtZXMgdHJpbml0eS1yaW5ncy1zcGlubmVyLWNpcmNsZTItYW5pbWF0aW9ue1xuICAgICAgICAgIDAlICAgeyB0cmFuc2Zvcm06IHJvdGF0ZVooMTAwZGVnKSByb3RhdGVYKDBkZWcpOyB9XG4gICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlWigwZGVnKSAgIHJvdGF0ZVgoMzYwZGVnKTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgQGtleWZyYW1lcyB0cmluaXR5LXJpbmdzLXNwaW5uZXItY2lyY2xlMy1hbmltYXRpb257XG4gICAgICAgICAgMCUgICB7IHRyYW5zZm9ybTogcm90YXRlWigxMDBkZWcpICByb3RhdGVYKC0zNjBkZWcpOyB9XG4gICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlWigtMzYwZGVnKSByb3RhdGVYKDM2MGRlZyk7IH1cbiAgICAgICAgfVxuICAgICAgPC9zdHlsZT5cblxuICAgICAgPGRpdiBjbGFzcz1cInRyaW5pdHktcmluZ3Mtc3Bpbm5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjaXJjbGVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZVwiPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoVHJpbml0eVJpbmdzU3Bpbm5lci5pcywgVHJpbml0eVJpbmdzU3Bpbm5lcik7XG4iXSwibmFtZXMiOlsicmVuZGVyIiwiaHRtbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0VBQUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBOztFQUVBLE1BQU0sQ0FBQyx5QkFBeUIsR0FBRyxTQUFTLElBQUksRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQzs7RUNWbkU7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0EsQUFDQTtFQUNBO0VBQ0EsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLEFBV0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0EsRUFBTyxNQUFNLGFBQWEsR0FBRyxTQUFTLEtBQUssRUFBRTtFQUM3QyxFQUFFLElBQUksaUJBQWlCLGdDQUFnQyxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQztFQUNuRixFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtFQUMxQixJQUFJLGlCQUFpQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7RUFDdEMsaUNBQWlDLENBQUMsS0FBSyxFQUFFLG1CQUFtQixHQUFHLGlCQUFpQixDQUFDO0VBQ2pGLEdBQUc7RUFDSDtFQUNBLEVBQUUsSUFBSSxhQUFhLEdBQUcsUUFBUSxFQUFFLENBQUM7RUFDakMsRUFBRSxTQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUU7RUFDL0IsSUFBSSxJQUFJLE9BQU8sZ0NBQWdDLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FB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QUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDM0Q7RUFDQTtFQUNBO0VBQ0E7RUFDQSxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDdEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsTUFBTSxzQkFBc0IsR0FBRyx3SkFBd0osQ0FBQztFQUN4TDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRTtFQUMzQixJQUFJLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDdkMsSUFBSSxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDN0MsSUFBSSxPQUFPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztFQUMxQyxDQUFDO0VBQ0Q7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQSxFQUFPLE1BQU0sWUFBWSxDQUFDO0VBQzFCLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7RUFDckQsUUFB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QUFJLENBQUMsSUFBSSxDQUFDOzs7O3VGQUkwQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Ozs7Ozs2REFNMUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7dURBWW5CLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7dURBS3JFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7dURBS3JFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7dURBS3JFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7dURBS3JFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7dURBS3JFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7dURBS3JFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7dURBS3JFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7dURBS3JFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3NEQUN2RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBcUJ4SCxDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDOztFQ25JMUQsTUFBTSxhQUFhLFNBQVMsVUFBVSxDQUFDO0VBQzlDLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxPQUFPLGdCQUFnQixDQUFDLEVBQUU7O0VBRTlDLEVBQUUsV0FBVyxVQUFVLEdBQUc7RUFDMUIsSUFBSSxPQUFPO0VBQ1gsTUFBTSxLQUFLLEVBQUUsTUFBTTtFQUNuQixNQUFNLFFBQVEsRUFBRSxNQUFNO0VBQ3RCLE1BQU0sSUFBSSxFQUFFLE1BQU07RUFDbEIsS0FBSyxDQUFDO0VBQ04sR0FBRzs7RUFFSCxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLEtBQUssRUFBRSxDQUFDOztFQUVaLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7RUFDeEIsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ25CLEdBQUc7O0VBRUgsRUFBRSxPQUFPLEdBQUc7RUFDWixJQUFJLE9BQU9BLE1BQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7NkNBYzZCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7NENBRWIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O2tEQUlOLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztpREFDYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7eUZBSTRCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzt1REFDbEQsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzs7Ozs7O3dGQU9vQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7dURBQ2pELEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7Ozs7Ozs7O3lEQVNYLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7Ozt5REFNYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzs7O3lEQUliLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7O3lEQUtiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs2Q0FDekIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzZDQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs2Q0FDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7NkNBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzZDQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs2Q0FDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7NkNBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzs7eURBR0QsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7O3lEQUdiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7eURBQ2IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3lEQUNiLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDYixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7Ozs7OztJQVlsRSxDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7O0VDOUloRCxNQUFNLCtCQUErQixTQUFTLFVBQVUsQ0FBQztFQUNoRSxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsT0FBTyxvQ0FBb0MsQ0FBQyxFQUFFOztFQUVsRSxFQUFFLFdBQVcsVUFBVSxHQUFHO0VBQzFCLElBQUksT0FBTztFQUNYLE1BQU0sS0FBSyxFQUFFLE1BQU07RUFDbkIsTUFBTSxRQUFRLEVBQUUsTUFBTTtFQUN0QixNQUFNLElBQUksRUFBRSxNQUFNO0VBQ2xCLEtBQUssQ0FBQztFQUNOLEdBQUc7O0VBRUgsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7RUFFWixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7RUFDdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNuQixHQUFHOztFQUVILEVBQUUsT0FBTyxHQUFHO0VBQ1osSUFBSSxPQUFPQSxNQUFJLENBQUM7Ozs7Ozs7Ozs7OzhIQVc4RyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7aUVBQzdFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Z0VBRWIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O29JQUl3RCxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7O3NFQUU5RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsa0VBQWtFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQztpRUFDaEcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O2dFQUliLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OztxSUFJeUQsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOztzRUFFL0UsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGlFQUFpRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7aUVBQy9GLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7aUVBRWIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Z0VBR2IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXlGeEUsQ0FBQyxDQUFDO0VBQ04sR0FBRztFQUNILENBQUM7O0VBRUQsY0FBYyxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxFQUFFLEVBQUUsK0JBQStCLENBQUMsQ0FBQzs7RUN0SnBGLE1BQU0sdUJBQXVCLFNBQVMsVUFBVSxDQUFDO0VBQ3hELEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxPQUFPLDJCQUEyQixDQUFDLEVBQUU7O0VBRXpELEVBQUUsV0FBVyxVQUFVLEdBQUc7RUFDMUIsSUFBSSxPQUFPO0VBQ1gsTUFBTSxLQUFLLEVBQUUsTUFBTTtFQUNuQixNQUFNLFFBQVEsRUFBRSxNQUFNO0VBQ3RCLE1BQU0sSUFBSSxFQUFFLE1BQU07RUFDbEIsS0FBSyxDQUFDO0VBQ04sR0FBRzs7RUFFSCxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLEtBQUssRUFBRSxDQUFDOztFQUVaLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7RUFDM0IsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztFQUN0QixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ25CLEdBQUc7O0VBRUgsRUFBRSxPQUFPLEdBQUc7RUFDWixJQUFJLE9BQU9BLE1BQUksQ0FBQzs7Ozs7Ozs7Ozs7d0RBV3dDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzt1REFDYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7O21FQUVBLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzttR0FDbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzs7Ozs7bUVBTWhELEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7O3lHQUd5QixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBdUJySCxDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDOztFQ3ZFcEUsTUFBTSxpQkFBaUIsU0FBUyxVQUFVLENBQUM7RUFDbEQsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLE9BQU8scUJBQXFCLENBQUMsRUFBRTs7RUFFbkQsRUFBRSxXQUFXLFVBQVUsR0FBRztFQUMxQixJQUFJLE9BQU87RUFDWCxNQUFNLEtBQUssRUFBRSxNQUFNO0VBQ25CLE1BQU0sUUFBUSxFQUFFLE1BQU07RUFDdEIsTUFBTSxJQUFJLEVBQUUsTUFBTTtFQUNsQixLQUFLLENBQUM7RUFDTixHQUFHOztFQUVILEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7O0VBRVosSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztFQUN0QixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbkIsR0FBRzs7RUFFSCxFQUFFLE9BQU8sR0FBRztFQUNaLElBQUksT0FBT0EsTUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7a0RBWWtDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7aURBRWIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozt1REFLTixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7O3VGQVFvQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7NkRBQzFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7Ozt1RkFJYSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Z0VBQ3ZDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7Ozs7Ozs7Ozs7OztJQWF6RSxDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDOztFQ3RFeEQsTUFBTSxpQkFBaUIsU0FBUyxVQUFVLENBQUM7RUFDbEQsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLE9BQU8scUJBQXFCLENBQUMsRUFBRTs7RUFFbkQsRUFBRSxXQUFXLFVBQVUsR0FBRztFQUMxQixJQUFJLE9BQU87RUFDWCxNQUFNLFFBQVEsRUFBRSxNQUFNO0VBQ3RCLE1BQU0sS0FBSyxFQUFFLE1BQU07RUFDbkIsTUFBTSxPQUFPLEVBQUUsTUFBTTtFQUNyQixNQUFNLElBQUksRUFBRSxNQUFNO0VBQ2xCLEtBQUssQ0FBQztFQUNOLEdBQUc7O0VBRUgsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7RUFFWixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7RUFDdEIsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztFQUNyQixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ25CLEdBQUc7O0VBRUgsRUFBRSxPQUFPLEdBQUc7RUFDWixJQUFJLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztFQUN6QixJQUFJLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQzs7RUFFcEIsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtFQUM1QyxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUNBLE1BQUksQ0FBQzs0Q0FDa0IsRUFBRSxDQUFDLENBQUM7b0VBQ29CLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDOztNQUV6RyxDQUFDLENBQUMsQ0FBQzs7RUFFVCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUNBLE1BQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7RUFDL0MsS0FBSzs7RUFFTCxJQUFJLE9BQU9BLE1BQUksQ0FBQzs7Ozs7Ozs7Ozs7a0RBV2tDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztzREFDUixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7Ozs7dUZBSUosRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzt1REFFaEQsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7O2tEQUU5RSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7eURBQ0wsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOztpREFFcEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7UUFHckQsRUFBRSxTQUFTLENBQUM7Ozs7Ozs7Ozs7Ozs7OztRQWVaLEVBQUUsSUFBSSxDQUFDOztJQUVYLENBQUMsQ0FBQztFQUNOLEdBQUc7RUFDSCxDQUFDOztFQUVELGNBQWMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLGlCQUFpQixDQUFDLENBQUM7O0VDbEZ4RCxNQUFNLDBCQUEwQixTQUFTLFVBQVUsQ0FBQztFQUMzRCxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsT0FBTyw4QkFBOEIsQ0FBQyxFQUFFOztFQUU1RCxFQUFFLFdBQVcsVUFBVSxHQUFHO0VBQzFCLElBQUksT0FBTztFQUNYLE1BQU0sS0FBSyxFQUFFLE1BQU07RUFDbkIsTUFBTSxRQUFRLEVBQUUsTUFBTTtFQUN0QixNQUFNLElBQUksRUFBRSxNQUFNO0VBQ2xCLEtBQUssQ0FBQztFQUNOLEdBQUc7O0VBRUgsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7RUFFWixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7RUFDeEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNuQixHQUFHOztFQUVILEVBQUUsT0FBTyxHQUFHO0VBQ1osSUFBSSxPQUFPQSxNQUFJLENBQUM7Ozs7Ozs7Ozs7O2dFQVdnRCxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7K0RBQ2IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7MEdBUytCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7OzJEQUcvRCxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7MERBQ2IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OztzRUFLQSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs4REFlckIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzZEQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs4REFJWCxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7NkRBQ2IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs2REFLWixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7OERBSVgsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzZEQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs4REFJWCxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7NkRBQ2IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs2REFLWixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBb0JyRSxDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDOztFQ25IMUUsTUFBTSx1QkFBdUIsU0FBUyxVQUFVLENBQUM7RUFDeEQsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLE9BQU8sMkJBQTJCLENBQUMsRUFBRTs7RUFFekQsRUFBRSxXQUFXLFVBQVUsR0FBRztFQUMxQixJQUFJLE9BQU87RUFDWCxNQUFNLEtBQUssRUFBRSxNQUFNO0VBQ25CLE1BQU0sUUFBUSxFQUFFLE1BQU07RUFDdEIsTUFBTSxJQUFJLEVBQUUsTUFBTTtFQUNsQixLQUFLLENBQUM7RUFDTixHQUFHOztFQUVILEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7O0VBRVosSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0VBQ3hCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbkIsR0FBRzs7RUFFSCxFQUFFLE9BQU8sR0FBRztFQUNaLElBQUksT0FBT0EsTUFBSSxDQUFDOzs7Ozs7Ozs7Ozt3REFXd0MsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs0REFFUixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7bUdBSTJCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzttRUFDaEQsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzt3REFFeEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzJEQUNULEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozt1REFJaEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OzBFQUlPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7OzswRUFJaEIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzs7OzBFQUloQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7OztJQWV0RixDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDOztFQzVFcEUsTUFBTSxZQUFZLFNBQVMsVUFBVSxDQUFDO0VBQzdDLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxPQUFPLGVBQWUsQ0FBQyxFQUFFOztFQUU3QyxFQUFFLFdBQVcsVUFBVSxHQUFHO0VBQzFCLElBQUksT0FBTztFQUNYLE1BQU0sS0FBSyxFQUFFLE1BQU07RUFDbkIsTUFBTSxRQUFRLEVBQUUsTUFBTTtFQUN0QixNQUFNLElBQUksRUFBRSxNQUFNO0VBQ2xCLEtBQUssQ0FBQztFQUNOLEdBQUc7O0VBRUgsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7RUFFWixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7RUFDeEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNuQixHQUFHOztFQUVILEVBQUUsT0FBTyxHQUFHO0VBQ1osSUFBSSxPQUFPQSxNQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs0Q0FZNEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzsyQ0FFYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7Ozs7OztxRkFZOEIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzhEQUN2QyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7OztxRkFNVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7NkRBQ3hDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7Ozs7O3VGQU1hLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzsyREFDNUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEyQnBFLENBQUMsQ0FBQztFQUNOLEdBQUc7RUFDSCxDQUFDOztFQUVELGNBQWMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQzs7RUM1RjlDLE1BQU0sWUFBWSxTQUFTLFVBQVUsQ0FBQztFQUM3QyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsT0FBTyxlQUFlLENBQUMsRUFBRTs7RUFFN0MsRUFBRSxXQUFXLFVBQVUsR0FBRztFQUMxQixJQUFJLE9BQU87RUFDWCxNQUFNLEtBQUssRUFBRSxNQUFNO0VBQ25CLE1BQU0sUUFBUSxFQUFFLE1BQU07RUFDdEIsTUFBTSxJQUFJLEVBQUUsTUFBTTtFQUNsQixLQUFLLENBQUM7RUFDTixHQUFHOztFQUVILEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7O0VBRVosSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0VBQ3RCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbkIsR0FBRzs7RUFFSCxFQUFFLE9BQU8sR0FBRztFQUNaLElBQUksT0FBT0EsTUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs0Q0FjNEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzsyQ0FFYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7MkVBSW9CLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzt1REFDcEMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzs7Ozs7Ozs7NENBU3hCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQztpREFDUixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Z0RBQ2IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW1DeEQsQ0FBQyxDQUFDO0VBQ04sR0FBRztFQUNILENBQUM7O0VBRUQsY0FBYyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDOztFQzNGOUMsTUFBTSxZQUFZLFNBQVMsVUFBVSxDQUFDO0VBQzdDLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxPQUFPLGVBQWUsQ0FBQyxFQUFFOztFQUU3QyxFQUFFLFdBQVcsVUFBVSxHQUFHO0VBQzFCLElBQUksT0FBTztFQUNYLE1BQU0sS0FBSyxFQUFFLE1BQU07RUFDbkIsTUFBTSxRQUFRLEVBQUUsTUFBTTtFQUN0QixNQUFNLElBQUksRUFBRSxNQUFNO0VBQ2xCLEtBQUssQ0FBQztFQUNOLEdBQUc7O0VBRUgsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7RUFFWixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7RUFDdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNuQixHQUFHOztFQUVILEVBQUUsT0FBTyxHQUFHO0VBQ1osSUFBSSxPQUFPQSxNQUFJLENBQUM7Ozs7Ozs7Ozs7OzRDQVc0QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7OzJDQUViLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OzsyRUFJb0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzs7Ozs7Ozs7OERBUzdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztrREFDNUIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OzhEQUlBLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztrREFDNUIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OzhEQUlBLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztrREFDNUIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OztrREFLWixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7O2lEQUtiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7O3dEQU1MLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt5REFDWixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQ2xFLENBQUMsQ0FBQztFQUNOLEdBQUc7RUFDSCxDQUFDOztFQUVELGNBQWMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQzs7RUNoSDlDLE1BQU0scUJBQXFCLFNBQVMsVUFBVSxDQUFDO0VBQ3RELEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxPQUFPLHlCQUF5QixDQUFDLEVBQUU7O0VBRXZELEVBQUUsV0FBVyxVQUFVLEdBQUc7RUFDMUIsSUFBSSxPQUFPO0VBQ1gsTUFBTSxLQUFLLEVBQUUsTUFBTTtFQUNuQixNQUFNLFFBQVEsRUFBRSxNQUFNO0VBQ3RCLE1BQU0sSUFBSSxFQUFFLE1BQU07RUFDbEIsS0FBSyxDQUFDO0VBQ04sR0FBRzs7RUFFSCxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLEtBQUssRUFBRSxDQUFDOztFQUVaLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7RUFDM0IsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztFQUN6QixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ25CLEdBQUc7O0VBRUgsRUFBRSxPQUFPLEdBQUc7RUFDWixJQUFJLE9BQU9BLE1BQUksQ0FBQzs7Ozs7Ozs7Ozs7O3VGQVl1RSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7OztzREFHakQsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O3FEQUliLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OztzRUFJSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7OzJEQUUzQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsNkRBQTZELEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzsyREFDdEYsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OzBEQUliLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUErQ2xFLENBQUMsQ0FBQztFQUNOLEdBQUc7RUFDSCxDQUFDOztFQUVELGNBQWMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLENBQUM7O0VDckdoRSxNQUFNLHlCQUF5QixTQUFTLFVBQVUsQ0FBQztFQUMxRCxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsT0FBTyw4QkFBOEIsQ0FBQyxFQUFFOztFQUU1RCxFQUFFLFdBQVcsVUFBVSxHQUFHO0VBQzFCLElBQUksT0FBTztFQUNYLE1BQU0sS0FBSyxFQUFFLE1BQU07RUFDbkIsTUFBTSxRQUFRLEVBQUUsTUFBTTtFQUN0QixNQUFNLElBQUksRUFBRSxNQUFNO0VBQ2xCLEtBQUssQ0FBQztFQUNOLEdBQUc7O0VBRUgsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7RUFFWixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7RUFDdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNuQixHQUFHOztFQUVILEVBQUUsT0FBTyxHQUFHO0VBQ1osSUFBSSxPQUFPQSxNQUFJLENBQUM7Ozs7Ozs7Ozs7O2dFQVdnRCxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7NkRBQ2YsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOytEQUNWLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OytGQUdvQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Z0VBQy9DLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7MkRBRWxCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztzRUFDRCxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7b0VBQ2QsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7NkRBR25CLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzswREFDZixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7NkVBSU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzs7OzZFQUloQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Ozs7NkVBSWhCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7Ozs2RUFJaEIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzs7OzZFQUloQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Ozs7NkVBSWhCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7Ozs2RUFJaEIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzs7OzZFQUloQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Ozs7NkVBSWhCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXdDekYsQ0FBQyxDQUFDO0VBQ04sR0FBRztFQUNILENBQUM7O0VBRUQsY0FBYyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLEVBQUUseUJBQXlCLENBQUMsQ0FBQzs7RUM3SHhFLE1BQU0sZ0JBQWdCLFNBQVMsVUFBVSxDQUFDO0VBQ2pELEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxPQUFPLG1CQUFtQixDQUFDLEVBQUU7O0VBRWpELEVBQUUsV0FBVyxVQUFVLEdBQUc7RUFDMUIsSUFBSSxPQUFPO0VBQ1gsTUFBTSxLQUFLLEVBQUUsTUFBTTtFQUNuQixNQUFNLFFBQVEsRUFBRSxNQUFNO0VBQ3RCLE1BQU0sSUFBSSxFQUFFLE1BQU07RUFDbEIsS0FBSyxDQUFDO0VBQ04sR0FBRzs7RUFFSCxFQUFFLFdBQVcsR0FBRztFQUNoQixJQUFJLEtBQUssRUFBRSxDQUFDOztFQUVaLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7RUFDM0IsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztFQUN0QixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ25CLEdBQUc7O0VBRUgsRUFBRSxPQUFPLEdBQUc7RUFDWixJQUFJLE9BQU9BLE1BQUksQ0FBQzs7Ozs7Ozs7Ozs7Z0RBV2dDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7K0NBRWIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O21GQUl3QixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7OzREQUV2QyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7MkRBSWQsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDOzJEQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7a0VBS0wsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO3FEQUM3QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzttREFDOUQsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO2tEQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztvREFDVixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7a0VBSzlDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztxREFDN0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7bURBQzlELEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztrREFDYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7b0RBQ1YsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7O2tFQUs5QyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7cURBQzdCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO21EQUM5RCxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7a0RBQ2IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO29EQUNWLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OztrRUFLOUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO3FEQUM3QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzttREFDOUQsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO2tEQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztvREFDVixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7a0VBSzlDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztxREFDN0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7bURBQzlELEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztrREFDYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7b0RBQ1YsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7SUFnQjVHLENBQUMsQ0FBQztFQUNOLEdBQUc7RUFDSCxDQUFDOztFQUVELGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7O0VDN0d0RCxNQUFNLGFBQWEsU0FBUyxVQUFVLENBQUM7RUFDOUMsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLE9BQU8sZ0JBQWdCLENBQUMsRUFBRTs7RUFFOUMsRUFBRSxXQUFXLFVBQVUsR0FBRztFQUMxQixJQUFJLE9BQU87RUFDWCxNQUFNLEtBQUssRUFBRSxNQUFNO0VBQ25CLE1BQU0sUUFBUSxFQUFFLE1BQU07RUFDdEIsTUFBTSxJQUFJLEVBQUUsTUFBTTtFQUNsQixLQUFLLENBQUM7RUFDTixHQUFHOztFQUVILEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7O0VBRVosSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0VBQ3RCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbkIsR0FBRzs7RUFFSCxFQUFFLE9BQU8sR0FBRztFQUNaLElBQUksT0FBT0EsTUFBSSxDQUFDOzs7Ozs7Ozs7Ozs2Q0FXNkIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzRDQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OztrREFJTixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7OzRDQUVsQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7OzZFQVFxQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Ozs7MERBSW5DLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7d0RBRWYsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO3dEQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs2Q0FDdkIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs0Q0FFYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7OzBEQUtFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OzswREFJWixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7OzBEQUtaLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OzswREFJWixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7MERBSVosRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7OztJQWNsRSxDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7O0VDaEdoRCxNQUFNLHNCQUFzQixTQUFTLFVBQVUsQ0FBQztFQUN2RCxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsT0FBTywwQkFBMEIsQ0FBQyxFQUFFOztFQUV4RCxFQUFFLFdBQVcsVUFBVSxHQUFHO0VBQzFCLElBQUksT0FBTztFQUNYLE1BQU0sS0FBSyxFQUFFLE1BQU07RUFDbkIsTUFBTSxRQUFRLEVBQUUsTUFBTTtFQUN0QixNQUFNLElBQUksRUFBRSxNQUFNO0VBQ2xCLEtBQUssQ0FBQztFQUNOLEdBQUc7O0VBRUgsRUFBRSxXQUFXLEdBQUc7RUFDaEIsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7RUFFWixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0VBQzNCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7RUFDdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztFQUNuQixHQUFHOztFQUVILEVBQUUsT0FBTyxHQUFHO0VBQ1osSUFBSSxPQUFPQSxNQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7O3VEQWN1QyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7OztzREFHYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7dUVBSUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzs0REFFM0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLDhEQUE4RCxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7NERBQ3ZGLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OzsyREFJYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7eUVBSUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzs7Ozs7Ozs7O3lFQVVoQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZ0NyRixDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDOztFQ2xHbEUsTUFBTSxtQkFBbUIsU0FBUyxVQUFVLENBQUM7RUFDcEQsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLE9BQU8sdUJBQXVCLENBQUMsRUFBRTs7RUFFckQsRUFBRSxXQUFXLFVBQVUsR0FBRztFQUMxQixJQUFJLE9BQU87RUFDWCxNQUFNLEtBQUssRUFBRSxNQUFNO0VBQ25CLE1BQU0sUUFBUSxFQUFFLE1BQU07RUFDdEIsTUFBTSxJQUFJLEVBQUUsTUFBTTtFQUNsQixLQUFLLENBQUM7RUFDTixHQUFHOztFQUVILEVBQUUsV0FBVyxHQUFHO0VBQ2hCLElBQUksS0FBSyxFQUFFLENBQUM7O0VBRVosSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0VBQ3hCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbkIsR0FBRzs7RUFFSCxFQUFFLE9BQU8sR0FBRztFQUNaLElBQUksT0FBT0EsTUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7Ozt5REFjeUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozt3REFLYixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7OytEQUtMLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzs7Ozs7OzttR0FPdUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOztvREFFL0QsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO21EQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OzttR0FJb0MsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzt5REFFMUQsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3dEQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7OztrR0FJOEIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDOzt5REFFekQsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3dEQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBd0JoRSxDQUFDLENBQUM7RUFDTixHQUFHO0VBQ0gsQ0FBQzs7RUFFRCxjQUFjLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9

(() => {
  // ns-params:@params
  var enable_exif = false;
  var reverse = true;
  var shuffle = false;

  // ns-hugo:/home/aleson/.cache/hugo_cache/modules/filecache/modules/pkg/mod/github.com/bep/gallerydeluxe@v0.10.0/assets/js/gallerydeluxe/src/pig.js
  var optimizedResize = /* @__PURE__ */ function() {
    const callbacks = [];
    let running = false;
    function resize() {
      if (!running) {
        running = true;
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(runCallbacks);
        } else {
          setTimeout(runCallbacks, 66);
        }
      }
    }
    function runCallbacks() {
      callbacks.forEach(function(callback) {
        callback();
      });
      running = false;
    }
    return {
      /**
       * Add a callback to be run on resize.
       *
       * @param {function} callback - the callback to run on resize.
       */
      add: function(callback) {
        if (!callbacks.length) {
          window.addEventListener("resize", resize);
        }
        callbacks.push(callback);
      },
      /**
       * Disables all resize handlers.
       */
      disable: function() {
        window.removeEventListener("resize", resize);
      },
      /**
       * Enables all resize handlers, if they were disabled.
       */
      reEnable: function() {
        window.addEventListener("resize", resize);
      }
    };
  }();
  function _injectStyle(containerId, classPrefix, transitionSpeed) {
    const css = "#" + containerId + " {  position: relative;}." + classPrefix + "-figure {  background-color: #D5D5D5;  overflow: hidden;  left: 0;  position: absolute;  top: 0;  margin: 0;}." + classPrefix + "-figure img {  left: 0;  position: absolute;  top: 0;  height: 100%;  width: 100%;  opacity: 0;  transition: " + (transitionSpeed / 1e3).toString(10) + "s ease opacity;  -webkit-transition: " + (transitionSpeed / 1e3).toString(10) + "s ease opacity;}." + classPrefix + "-figure img." + classPrefix + "-thumbnail {  -webkit-filter: blur(30px);  filter: blur(30px);  left: auto;  position: relative;  width: auto;}." + classPrefix + "-figure img." + classPrefix + "-loaded {  opacity: 1;}";
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.type = "text/css";
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
  }
  function _extend(obj1, obj2) {
    for (const i in obj2) {
      if (obj2.hasOwnProperty(i)) {
        obj1[i] = obj2[i];
      }
    }
  }
  function _getOffsetTop(elem) {
    let offsetTop = 0;
    do {
      if (!isNaN(elem.offsetTop)) {
        offsetTop += elem.offsetTop;
      }
      elem = elem.offsetParent;
    } while (elem);
    return offsetTop;
  }
  function Pig(imageData, options) {
    this.inRAF = false;
    this.isTransitioning = false;
    this.minAspectRatioRequiresTransition = false;
    this.minAspectRatio = null;
    this.latestYOffset = 0;
    this.lastWindowWidth = window.innerWidth;
    this.scrollDirection = "down";
    this.visibleImages = [];
    this.settings = {
      /**
       * Type: string
       * Default: 'pig'
       * Description: The class name of the element inside of which images should
       *   be loaded.
       */
      containerId: "pig",
      /**
       * Type: window | HTMLElement
       * Default: window
       * Description: The window or HTML element that the grid scrolls in.
       */
      scroller: window,
      /**
       * Type: string
       * Default: 'pig'
       * Description: The prefix associated with this library that should be
       *   prepended to class names within the grid.
       */
      classPrefix: "pig",
      /**
       * Type: string
       * Default: 'figure'
       * Description: The tag name to use for each figure. The default setting is
       *   to use a <figure></figure> tag.
       */
      figureTagName: "figure",
      /**
       * Type: Number
       * Default: 8
       * Description: Size in pixels of the gap between images in the grid.
       */
      spaceBetweenImages: 8,
      /**
       * Type: Number
       * Default: 500
       * Description: Transition speed in milliseconds
       */
      transitionSpeed: 500,
      /**
       * Type: Number
       * Default: 3000
       * Description: Height in pixels of images to preload in the direction
       *   that the user is scrolling. For example, in the default case, if the
       *   user is scrolling down, 1000px worth of images will be loaded below
       *   the viewport.
       */
      primaryImageBufferHeight: 1e3,
      /**
       * Type: Number
       * Default: 100
       * Description: Height in pixels of images to preload in the direction
       *   that the user is NOT scrolling. For example, in the default case, if
       *   the user is scrolling down, 300px worth of images will be loaded
       *   above the viewport.  Images further up will be removed.
       */
      secondaryImageBufferHeight: 300,
      /**
       * Type: Number
       * Default: 20
       * Description: The height in pixels of the thumbnail that should be
       *   loaded and blurred to give the effect that images are loading out of
       *   focus and then coming into focus.
       */
      thumbnailSize: 20,
      /**
       * Get the URL for an image with the given filename & size.
       *
       * @param {string} filename - The filename of the image.
       * @param {Number} size - The size (height in pixels) of the image.
       *
       * @returns {string} The URL of the image at the given size.
       */
      urlForSize: function(filename, size) {
        return "/img/" + size.toString(10) + "/" + filename;
      },
      /**
       * Get the a custom style for the container element.
       *
       *  * @param {string} filename - The filename of the image.
       */
      styleForElement: function(filename) {
        return "";
      },
      /**
       * Get a callback with the filename of the image
       * which was clicked.
       *
       * @param {string} filename - The filename property of the image.
       */
      onClickHandler: null,
      /**
       * Get the minimum required aspect ratio for a valid row of images. The
       * perfect rows are maintained by building up a row of images by adding
       * together their aspect ratios (the aspect ratio when they are placed
       * next to each other) until that aspect ratio exceeds the value returned
       * by this function. Responsive reordering is achieved through changes
       * to what this function returns at different values of the passed
       * parameter `lastWindowWidth`.
       *
       * @param {Number} lastWindowWidth - The last computed width of the
       *                                   browser window.
       *
       * @returns {Number} The minimum aspect ratio at this window width.
       */
      getMinAspectRatio: function(lastWindowWidth) {
        if (lastWindowWidth <= 640) {
          return 2;
        } else if (lastWindowWidth <= 1280) {
          return 4;
        } else if (lastWindowWidth <= 1920) {
          return 5;
        }
        return 6;
      },
      /**
       * Get the image size (height in pixels) to use for this window width.
       * Responsive resizing of images is achieved through changes to what this
       * function returns at different values of the passed parameter
       * `lastWindowWidth`.
       *
       * @param {Number} lastWindowWidth - The last computed width of the
       *                                   browser window.
       *
       * @returns {Number} The size (height in pixels) of the images to load.
       */
      getImageSize: function(lastWindowWidth) {
        if (lastWindowWidth <= 640) {
          return 100;
        } else if (lastWindowWidth <= 1920) {
          return 250;
        }
        return 500;
      }
    };
    _extend(this.settings, options || {});
    this.container = document.getElementById(this.settings.containerId);
    if (!this.container) {
      console.error("Could not find element with ID " + this.settings.containerId);
    }
    this.scroller = this.settings.scroller;
    this.images = this._parseImageData(imageData);
    _injectStyle(this.settings.containerId, this.settings.classPrefix, this.settings.transitionSpeed);
    return this;
  }
  Pig.prototype._getTransitionTimeout = function() {
    const transitionTimeoutScaleFactor = 1.5;
    return this.settings.transitionSpeed * transitionTimeoutScaleFactor;
  };
  Pig.prototype._getTransitionString = function() {
    if (this.isTransitioning) {
      return (this.settings.transitionSpeed / 1e3).toString(10) + "s transform ease";
    }
    return "none";
  };
  Pig.prototype._recomputeMinAspectRatio = function() {
    const oldMinAspectRatio = this.minAspectRatio;
    this.minAspectRatio = this.settings.getMinAspectRatio(this.lastWindowWidth);
    if (oldMinAspectRatio !== null && oldMinAspectRatio !== this.minAspectRatio) {
      this.minAspectRatioRequiresTransition = true;
    } else {
      this.minAspectRatioRequiresTransition = false;
    }
  };
  Pig.prototype._parseImageData = function(imageData) {
    const progressiveImages = [];
    imageData.forEach(
      function(image, index) {
        const progressiveImage = new ProgressiveImage(image, index, this);
        progressiveImages.push(progressiveImage);
      }.bind(this)
    );
    return progressiveImages;
  };
  Pig.prototype._computeLayout = function() {
    const wrapperWidth = parseInt(this.container.clientWidth, 10);
    let row = [];
    let translateX = 0;
    let translateY = 0;
    let rowAspectRatio = 0;
    this._recomputeMinAspectRatio();
    if (!this.isTransitioning && this.minAspectRatioRequiresTransition) {
      this.isTransitioning = true;
      setTimeout(function() {
        this.isTransitioning = false;
      }, this._getTransitionTimeout());
    }
    const transition = this._getTransitionString();
    [].forEach.call(
      this.images,
      function(image, index) {
        rowAspectRatio += parseFloat(image.aspectRatio);
        row.push(image);
        if (rowAspectRatio >= this.minAspectRatio || index + 1 === this.images.length) {
          rowAspectRatio = Math.max(rowAspectRatio, this.minAspectRatio);
          const totalDesiredWidthOfImages = wrapperWidth - this.settings.spaceBetweenImages * (row.length - 1);
          const rowHeight = totalDesiredWidthOfImages / rowAspectRatio;
          row.forEach(
            function(img) {
              const imageWidth = rowHeight * img.aspectRatio;
              img.style = {
                width: parseInt(imageWidth, 10),
                height: parseInt(rowHeight, 10),
                translateX,
                translateY,
                transition
              };
              translateX += imageWidth + this.settings.spaceBetweenImages;
            }.bind(this)
          );
          row = [];
          rowAspectRatio = 0;
          translateY += parseInt(rowHeight, 10) + this.settings.spaceBetweenImages;
          translateX = 0;
        }
      }.bind(this)
    );
    this.totalHeight = translateY - this.settings.spaceBetweenImages;
  };
  Pig.prototype._doLayout = function() {
    this.container.style.height = this.totalHeight + "px";
    const bufferTop = this.scrollDirection === "up" ? this.settings.primaryImageBufferHeight : this.settings.secondaryImageBufferHeight;
    const bufferBottom = this.scrollDirection === "down" ? this.settings.secondaryImageBufferHeight : this.settings.primaryImageBufferHeight;
    const containerOffset = _getOffsetTop(this.container);
    const scrollerHeight = this.scroller === window ? window.innerHeight : this.scroller.offsetHeight;
    const minTranslateYPlusHeight = this.latestYOffset - containerOffset - bufferTop;
    const maxTranslateY = this.latestYOffset - containerOffset + scrollerHeight + bufferBottom;
    this.images.forEach(
      function(image) {
        if (image.style.translateY + image.style.height < minTranslateYPlusHeight || image.style.translateY > maxTranslateY) {
          image.hide();
        } else {
          image.load();
        }
      }.bind(this)
    );
  };
  Pig.prototype._getOnScroll = function() {
    const _this = this;
    const onScroll = function() {
      const newYOffset = _this.scroller === window ? window.pageYOffset : _this.scroller.scrollTop;
      _this.previousYOffset = _this.latestYOffset || newYOffset;
      _this.latestYOffset = newYOffset;
      _this.scrollDirection = _this.latestYOffset > _this.previousYOffset ? "down" : "up";
      if (!_this.inRAF) {
        _this.inRAF = true;
        window.requestAnimationFrame(function() {
          _this._doLayout();
          _this.inRAF = false;
        });
      }
    };
    return onScroll;
  };
  Pig.prototype.enable = function() {
    this.onScroll = this._getOnScroll();
    this.scroller.addEventListener("scroll", this.onScroll);
    this.onScroll();
    this._computeLayout();
    this._doLayout();
    const windowWidth = () => {
      return this.scroller === window ? window.innerWidth : this.scroller.offsetWidth;
    };
    optimizedResize.add(
      function() {
        this.lastWindowWidth = windowWidth();
        this._computeLayout();
        this._doLayout();
        let newWindowWidth = windowWidth();
        if (newWindowWidth !== this.lastWindowWidth) {
          this.lastWindowWidth = newWindowWidth;
          this._computeLayout();
          this._doLayout();
        }
      }.bind(this)
    );
    return this;
  };
  Pig.prototype.disable = function() {
    this.scroller.removeEventListener("scroll", this.onScroll);
    optimizedResize.disable();
    return this;
  };
  function ProgressiveImage(singleImageData, index, pig) {
    this.existsOnPage = false;
    this.aspectRatio = singleImageData.aspectRatio;
    this.filename = singleImageData.filename;
    this.index = index;
    this.pig = pig;
    this.classNames = {
      figure: pig.settings.classPrefix + "-figure",
      thumbnail: pig.settings.classPrefix + "-thumbnail",
      loaded: pig.settings.classPrefix + "-loaded"
    };
    return this;
  }
  ProgressiveImage.prototype.load = function() {
    this.existsOnPage = true;
    this._updateStyles();
    this.pig.container.appendChild(this.getElement());
    setTimeout(
      function() {
        if (!this.existsOnPage) {
          return;
        }
        if (!this.thumbnail) {
          this.thumbnail = new Image();
          this.thumbnail.src = this.pig.settings.urlForSize(this.filename, this.pig.settings.thumbnailSize);
          this.thumbnail.className = this.classNames.thumbnail;
          this.thumbnail.onload = function() {
            if (this.thumbnail) {
              this.thumbnail.className += " " + this.classNames.loaded;
            }
          }.bind(this);
          this.getElement().appendChild(this.thumbnail);
        }
        if (!this.fullImage) {
          this.fullImage = new Image();
          this.fullImage.src = this.pig.settings.urlForSize(
            this.filename,
            this.pig.settings.getImageSize(this.pig.lastWindowWidth)
          );
          this.fullImage.onload = function() {
            if (this.fullImage) {
              this.fullImage.className += " " + this.classNames.loaded;
            }
          }.bind(this);
          this.getElement().appendChild(this.fullImage);
        }
      }.bind(this),
      100
    );
  };
  ProgressiveImage.prototype.hide = function() {
    if (this.getElement()) {
      if (this.thumbnail) {
        this.thumbnail.src = "";
        this.getElement().removeChild(this.thumbnail);
        delete this.thumbnail;
      }
      if (this.fullImage) {
        this.fullImage.src = "";
        this.getElement().removeChild(this.fullImage);
        delete this.fullImage;
      }
    }
    if (this.existsOnPage) {
      this.pig.container.removeChild(this.getElement());
    }
    this.existsOnPage = false;
  };
  ProgressiveImage.prototype.getElement = function() {
    if (!this.element) {
      this.element = document.createElement(this.pig.settings.figureTagName);
      this.element.className = this.classNames.figure;
      let style = this.pig.settings.styleForElement(this.filename);
      if (this.style) {
        this.element.style = style;
      }
      if (this.pig.settings.onClickHandler !== null) {
        this.element.addEventListener(
          "click",
          function() {
            this.pig.settings.onClickHandler(this.filename);
          }.bind(this)
        );
      }
      this._updateStyles();
    }
    return this.element;
  };
  ProgressiveImage.prototype._updateStyles = function() {
    this.getElement().style.transition = this.style.transition;
    this.getElement().style.width = this.style.width + "px";
    this.getElement().style.height = this.style.height + "px";
    this.getElement().style.transform = "translate3d(" + this.style.translateX + "px," + this.style.translateY + "px, 0)";
  };

  // ns-hugo:/home/aleson/.cache/hugo_cache/modules/filecache/modules/pkg/mod/github.com/bep/gallerydeluxe@v0.10.0/assets/js/gallerydeluxe/src/helpers.js
  function newSwiper(el, callback) {
    const debug2 = 0 ? console.log.bind(console, "[swiper]") : function() {
    };
    const simulateTwoFingers = false;
    const moveThreshold = 50;
    const fingerDistance = (touches) => {
      return Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
    };
    var touch = {
      touchstart: { x: -1, y: -1, x2: -1, y2: -1, d: -1 },
      touchmove: { x: -1, y: -1, x2: -1, y2: -1, d: -1 },
      multitouch: false
    };
    touch.direction = function() {
      if (this.touchmove.x == -1) {
        return "";
      }
      let distancex = this.touchmove.x - this.touchstart.x;
      if (Math.abs(distancex) < moveThreshold) {
        let distancey = this.touchmove.y - this.touchstart.y;
        if (Math.abs(distancey) < moveThreshold) {
          return "";
        }
        return distancey > 0 ? "down" : "up";
      }
      return distancex > 0 ? "right" : "left";
    };
    touch.reset = function() {
      this.touchstart.x = -1, this.touchstart.y = -1;
      this.touchmove.x = -1, this.touchmove.y = -1;
      this.touchstart.d = -1, this.touchmove.d = -1;
      this.touchstart.x2 = -1, this.touchstart.y2 = -1;
      this.touchmove.x2 = -1, this.touchmove.y2 = -1;
      this.multitouch = false;
    };
    touch.update = function(event, touches) {
      this.multitouch = this.multitouch || touches.length > 1;
      if (touches.length > 1) {
        this[event.type].d = fingerDistance(touches);
        this[event.type].x2 = touches[1].pageX;
        this[event.type].y2 = touches[1].pageY;
      }
      this[event.type].x = touches[0].pageX;
      this[event.type].y = touches[0].pageY;
    };
    const pinch = function(event, touches) {
      let scale = 1;
      if (touches.length === 2) {
        if (event.scale) {
          scale = event.scale;
        } else {
          scale = touch.touchmove.d / touch.touchstart.d;
          scale = Math.round(scale * 100) / 100;
        }
        if (scale < 1) {
          scale = 1;
        }
        let distancex = ((touch.touchmove.x + touch.touchmove.x2) / 2 - (touch.touchstart.x + touch.touchstart.x2) / 2) * 2;
        let distancey = ((touch.touchmove.y + touch.touchmove.y2) / 2 - (touch.touchstart.y + touch.touchstart.y2) / 2) * 2;
        el.style.transform = `translate3d(${distancex}px, ${distancey}px, 0) scale(${scale})`;
        el.style.zIndex = 1e3;
      } else {
        el.style.transform = "";
        el.style.zIndex = "";
      }
    };
    var handleTouch = function(event) {
      debug2("event", event.type);
      if (typeof event !== "undefined" && typeof event.touches !== "undefined") {
        let touches = event.touches;
        if (simulateTwoFingers && touches.length === 1) {
          touches = [
            { pageX: touches[0].pageX, pageY: touches[0].pageY },
            { pageX: 0, pageY: 0 }
          ];
        }
        switch (event.type) {
          case "touchstart":
            touch.reset();
            touch.update(event, touches);
            break;
          case "touchmove":
            touch.update(event, touches);
            pinch(event, touches);
            break;
          case "touchend":
            el.style.transform = "";
            if (!touch.multitouch) {
              let direction = touch.direction();
              debug2("direction", direction);
              if (direction) {
                callback(direction);
              }
            }
            break;
          default:
            break;
        }
      }
    };
    el.addEventListener("touchstart", handleTouch, { passive: true });
    el.addEventListener("touchmove", handleTouch, { passive: true });
    el.addEventListener("touchend", handleTouch, { passive: true });
  }

  // ns-hugo:/home/aleson/.cache/hugo_cache/modules/filecache/modules/pkg/mod/github.com/bep/gallerydeluxe@v0.10.0/assets/js/gallerydeluxe/src/index.js
  var debug = 0 ? console.log.bind(console, "[gallery-deluxe]") : function() {
  };
  var GalleryDeluxe = {
    init: async function() {
      const galleryId = "gallerydeluxe";
      const dataAttributeName = "data-gd-image-data-url";
      const container = document.getElementById(galleryId);
      if (!container) {
        throw new Error(`No element with id ${galleryId} found.`);
      }
      const dataUrl = container.getAttribute(dataAttributeName);
      if (!dataUrl) {
        throw new Error(`No ${dataAttributeName} attribute found.`);
      }
      let activeImage;
      let exifTimeoutId;
      const modal = document.getElementById("gd-modal");
      const modalClose = modal.querySelector("#gd-modal-close");
      const preventDefault = function(e) {
        e.preventDefault();
      };
      let imageWrapper = document.createElement("div");
      imageWrapper.classList.add("gd-modal-content-wrapper");
      modal.insertBefore(imageWrapper, modal.firstChild);
      const closeModal = (e) => {
        if (e) {
          e.preventDefault();
        }
        imageWrapper.removeEventListener("touchmove", preventDefault);
        imageWrapper.removeEventListener("gesturestart", preventDefault);
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      };
      modalClose.addEventListener("click", function() {
        closeModal();
      });
      const swipe = function(direction) {
        debug("swipe", direction);
        switch (direction) {
          case "left":
            activeImage = activeImage.next;
            openActiveImage();
            break;
          case "right":
            activeImage = activeImage.prev;
            openActiveImage();
            break;
          default:
            closeModal();
            break;
        }
      };
      newSwiper(imageWrapper, function(direction) {
        swipe(direction);
      });
      document.addEventListener("keydown", function(e) {
        switch (e.key) {
          case "ArrowLeft":
            swipe("right");
            break;
          case "ArrowRight":
            swipe("left");
            break;
          case "Escape":
            closeModal(e);
            break;
        }
      });
      const openActiveImage = () => {
        imageWrapper.addEventListener("touchmove", preventDefault);
        imageWrapper.addEventListener("gesturestart", preventDefault);
        const classLoaded = "gd-modal-loaded";
        const classThumbnail = "gd-modal-thumbnail";
        document.body.style.overflow = "hidden";
        let oldEls = modal.querySelectorAll(".gd-modal-content");
        let oldElsRemoved = false;
        const removeOldEls = () => {
          if (oldElsRemoved) {
            return;
          }
          oldElsRemoved = true;
          oldEls.forEach((element) => {
            element.remove();
          });
        };
        if (activeImage) {
          let modal2 = document.getElementById("gd-modal");
          if (enable_exif) {
            if (exifTimeoutId) {
              clearTimeout(exifTimeoutId);
            }
            let exif = modal2.querySelector("#gd-modal-exif");
            const onTimeOutClass = "gd-modal-exif-ontimeout";
            let child = exif.lastElementChild;
            while (child) {
              exif.removeChild(child);
              child = exif.lastElementChild;
            }
            let dl = document.createElement("dl");
            exif.appendChild(dl);
            const addTag = (tag, value) => {
              let dt = document.createElement("dt");
              dt.innerText = camelToTitle(tag);
              dl.appendChild(dt);
              let dd = document.createElement("dd");
              dd.innerText = value;
              dl.appendChild(dd);
            };
            let date = new Date(activeImage.exif.Date);
            var dateString = new Date(date.getTime() - date.getTimezoneOffset() * 6e4).toISOString().split("T")[0];
            addTag("Date", dateString);
            let tags = activeImage.exif.Tags;
            for (const tag in tags) {
              addTag(tag, tags[tag]);
            }
            exif.classList.remove(onTimeOutClass);
            exifTimeoutId = setTimeout(() => {
              exif.classList.add(onTimeOutClass);
            }, 1200);
          }
          let thumbnail = new Image();
          thumbnail.classList.add("gd-modal-content");
          thumbnail.width = activeImage.width;
          thumbnail.height = activeImage.height;
          thumbnail.style.aspectRatio = activeImage.width / activeImage.height;
          const fullImage = thumbnail.cloneNode(false);
          thumbnail.classList.add(classThumbnail);
          fullImage.src = activeImage.full;
          thumbnail.src = activeImage["20"];
          thumbnail.onload = function() {
            if (thumbnail) {
              imageWrapper.appendChild(thumbnail);
              removeOldEls();
            }
          };
          fullImage.onload = function() {
            if (fullImage) {
              imageWrapper.appendChild(fullImage);
              fullImage.classList.add(classLoaded);
              if (thumbnail) {
                thumbnail.classList.add(classLoaded);
              }
              removeOldEls();
            }
          };
          modal2.style.display = "block";
        }
        setTimeout(function() {
          removeOldEls();
        }, 1e3);
      };
      let images = await (await fetch(dataUrl)).json();
      if (shuffle) {
        images = images.map((value) => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
      } else if (reverse) {
        images = images.reverse();
      }
      let imagesMap = /* @__PURE__ */ new Map();
      let imageData = [];
      for (let i = 0; i < images.length; i++) {
        let image = images[i];
        image.prev = images[(i + images.length - 1) % images.length];
        image.next = images[(i + 1) % images.length];
        imageData.push({ filename: image.name, aspectRatio: image.width / image.height, image });
        imagesMap.set(image.name, image);
      }
      var options = {
        onClickHandler: function(filename) {
          debug("onClickHandler", filename);
          activeImage = imagesMap.get(filename);
          if (activeImage) {
            openActiveImage();
          }
        },
        containerId: galleryId,
        classPrefix: "gd",
        spaceBetweenImages: 1,
        urlForSize: function(filename, size) {
          return imagesMap.get(filename)[size];
        },
        styleForElement: function(filename) {
          let image = imagesMap.get(filename);
          if (!image || image.colors.size < 1) {
            return "";
          }
          let colors = image.colors;
          let first = colors[0];
          let second = "#ccc";
          if (colors.length > 1) {
            second = colors[1];
          }
          return ` background: linear-gradient(15deg, ${first}, ${second});`;
        }
      };
      new Pig(imageData, options).enable();
    }
  };
  function camelToTitle(text) {
    return text.replace(/([A-Z])/g, " $1").replace(/^./, function(str) {
      return str.toUpperCase();
    });
  }
  var src_default = GalleryDeluxe;

  // <stdin>
  src_default.init();
})();
/*! The Pig library is MIT License (MIT) Copyright (c) 2015 Dan Schlosser, see https://github.com/schlosser/pig.js/blob/master/LICENSE.md  */

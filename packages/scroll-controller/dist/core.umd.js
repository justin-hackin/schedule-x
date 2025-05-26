(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@preact/signals')) :
  typeof define === 'function' && define.amd ? define(['exports', '@preact/signals'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SXScrollController = {}, global.preactSignals));
})(this, (function (exports, signals) { 'use strict';

  var PluginName;
  (function (PluginName) {
      PluginName["DragAndDrop"] = "dragAndDrop";
      PluginName["EventModal"] = "eventModal";
      PluginName["ScrollController"] = "scrollController";
      PluginName["EventRecurrence"] = "eventRecurrence";
      PluginName["Resize"] = "resize";
      PluginName["CalendarControls"] = "calendarControls";
      PluginName["CurrentTime"] = "currentTime";
  })(PluginName || (PluginName = {}));

  class InvalidTimeStringError extends Error {
      constructor(timeString) {
          super(`Invalid time string: ${timeString}`);
      }
  }

  // regex for strings between 00:00 and 23:59
  const timeStringRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

  const minuteTimePointMultiplier = 1.6666666666666667; // 100 / 60
  const timePointsFromString = (timeString) => {
      if (!timeStringRegex.test(timeString) && timeString !== '24:00')
          throw new InvalidTimeStringError(timeString);
      const [hoursInt, minutesInt] = timeString
          .split(':')
          .map((time) => parseInt(time, 10));
      let minutePoints = (minutesInt * minuteTimePointMultiplier).toString();
      if (minutePoints.split('.')[0].length < 2)
          minutePoints = `0${minutePoints}`;
      return Number(hoursInt + minutePoints);
  };

  // This enum is used to represent names of all internally built views of the calendar
  var InternalViewName;
  (function (InternalViewName) {
      InternalViewName["Day"] = "day";
      InternalViewName["Week"] = "week";
      InternalViewName["MonthGrid"] = "month-grid";
      InternalViewName["MonthAgenda"] = "month-agenda";
  })(InternalViewName || (InternalViewName = {}));

  const definePlugin = (name, definition) => {
      definition.name = name;
      return definition;
  };

  class ScrollControllerPlugin {
      constructor(config = {}) {
          Object.defineProperty(this, "config", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: config
          });
          Object.defineProperty(this, "name", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: PluginName.ScrollController
          });
          Object.defineProperty(this, "$app", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: null
          });
          Object.defineProperty(this, "observer", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: null
          });
          Object.defineProperty(this, "hasScrolledSinceViewRender", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: false
          });
      }
      /**
       * @internal
       * */
      onRender($app) {
          this.$app = $app;
          this.setInitialScroll($app);
          this.setUpViewChangeEffect();
      }
      setInitialScroll($app) {
          const gridDay = $app.elements.calendarWrapper.querySelector('.sx__time-grid-day');
          if (gridDay)
              this.scrollOnRender();
          else
              this.waitUntilGridDayExistsThenScroll();
      }
      setUpViewChangeEffect() {
          signals.effect(() => {
              var _a, _b;
              this.hasScrolledSinceViewRender = false;
              if (InternalViewName.Day === ((_a = this.$app) === null || _a === void 0 ? void 0 : _a.calendarState.view.value) ||
                  InternalViewName.Week === ((_b = this.$app) === null || _b === void 0 ? void 0 : _b.calendarState.view.value)) {
                  this.setInitialScroll(this.$app);
              }
          });
      }
      scrollOnRender() {
          this.scrollTo(this.config.initialScroll || '07:50');
      }
      destroy() {
          var _a;
          (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
      }
      /**
       * @param {string} time - time in format 'HH:mm'
       * */
      scrollTo(time) {
          if (!this.$app)
              throw new Error('[Schedule-X error]: Plugin not yet initialized. You cannot scroll before the calendar is rendered. For configuring the initial scroll, use the `initialScroll` parameter');
          const $app = this.$app;
          const pixelsPerHour = $app.config.weekOptions.value.gridHeight /
              ($app.config.timePointsPerDay / 100);
          const scrollToTimePoint = timePointsFromString(time);
          const hoursFromDayStart = $app.config.isHybridDay &&
              scrollToTimePoint < $app.config.dayBoundaries.value.start
              ? 2400 - $app.config.dayBoundaries.value.start + scrollToTimePoint
              : scrollToTimePoint - $app.config.dayBoundaries.value.start;
          const hoursPointsToScroll = hoursFromDayStart / 100;
          const pixelsToScroll = hoursPointsToScroll * pixelsPerHour;
          const viewContainer = $app.elements.calendarWrapper.querySelector('.sx__view-container');
          viewContainer.scroll(0, pixelsToScroll);
      }
      waitUntilGridDayExistsThenScroll() {
          this.observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                  var _a;
                  const gridDayExists = Array.from(mutation.addedNodes).find((node) => {
                      if (!(node instanceof HTMLElement))
                          return false;
                      return node.classList.contains('sx__time-grid-day');
                  });
                  if (mutation.type === 'childList' &&
                      gridDayExists &&
                      !this.hasScrolledSinceViewRender) {
                      this.scrollOnRender();
                      this.hasScrolledSinceViewRender = true;
                      (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
                  }
              });
          });
          this.observer.observe(this.$app.elements
              .calendarWrapper, {
              childList: true,
              subtree: true,
          });
      }
  }
  const createScrollControllerPlugin = (config = {}) => {
      return definePlugin('scrollController', new ScrollControllerPlugin(config));
  };

  exports.createScrollControllerPlugin = createScrollControllerPlugin;

}));

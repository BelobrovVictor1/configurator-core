(function () {
  "use strict";

  var currentScript =
    document.currentScript;

  if (!currentScript) {
    console.error(
      "[Configurator] Could not detect SDK script.",
    );

    return;
  }

  var scriptUrl =
    new URL(
      currentScript.src,
      window.location.href,
    );

  var configuratorOrigin =
    scriptUrl.origin;

  var containers =
    document.querySelectorAll(
      "[data-configurator-client]",
    );

  if (
    containers.length === 0
  ) {
    console.warn(
      "[Configurator] No configurator containers found.",
    );

    return;
  }

  var instances = [];

  function clampHeight(
    value,
  ) {
    var numericValue =
      Number(value);

    if (
      !Number.isFinite(
        numericValue,
      )
    ) {
      return null;
    }

    return Math.max(
      400,
      Math.min(
        6000,
        Math.ceil(
          numericValue,
        ),
      ),
    );
  }

  containers.forEach(
    function (
      container,
      index,
    ) {
      var clientSlug =
        container.getAttribute(
          "data-configurator-client",
        );

      if (!clientSlug) {
        return;
      }

      var iframe =
        document.createElement(
          "iframe",
        );

      iframe.src =
        configuratorOrigin +
        "/embed/" +
        encodeURIComponent(
          clientSlug,
        );

      iframe.title =
        container.getAttribute(
          "data-configurator-title",
        ) ||
        "Configurator";

      iframe.loading =
        container.getAttribute(
          "data-configurator-loading",
        ) ||
        "lazy";

      iframe.style.width =
        "100%";

      iframe.style.height =
        "800px";

      iframe.style.border =
        "0";

      iframe.style.display =
        "block";

      iframe.style.overflow =
        "hidden";

      iframe.style.background =
        "transparent";

      iframe.setAttribute(
        "scrolling",
        "no",
      );

      iframe.setAttribute(
        "data-configurator-frame",
        String(index),
      );

      container.innerHTML =
        "";

      container.appendChild(
        iframe,
      );

      var instance = {
        clientSlug:
          clientSlug,

        iframe:
          iframe,
      };

      instances.push(
        instance,
      );

      iframe.addEventListener(
        "load",
        function () {
          if (
            !iframe.contentWindow
          ) {
            return;
          }

          iframe.contentWindow.postMessage(
            {
              type:
                "configurator:request-resize",
            },
            configuratorOrigin,
          );
        },
      );
    },
  );

  window.addEventListener(
    "message",
    function (event) {
      if (
        event.origin !==
        configuratorOrigin
      ) {
        return;
      }

      if (
        !event.data ||
        event.data.type !==
          "configurator:resize"
      ) {
        return;
      }

      var instance =
        instances.find(
          function (
            candidate,
          ) {
            return (
              candidate
                .iframe
                .contentWindow ===
              event.source
            );
          },
        );

      if (!instance) {
        return;
      }

      if (
        event.data.clientSlug &&
        event.data.clientSlug !==
          instance.clientSlug
      ) {
        return;
      }

      var height =
        clampHeight(
          event.data.height,
        );

      if (!height) {
        return;
      }

      instance.iframe.style.height =
        height + "px";
    },
  );
})();
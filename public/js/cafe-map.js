/**
 * Cafe map glue: Leaflet + custom coffee-bean SVG markers.
 *
 * Reads cafes from <script type="application/json" id="cafe-map-data"> and the
 * mode from #cafe-map[data-mode]. Modes:
 *   - "dashboard": multi-marker map with fit-bounds.
 *   - "picker":    dashboard + click-to-set picker bean writing to lat/lng inputs.
 *   - "detail":    single marker, fixed zoom, branded popup.
 *
 * No bundler — plain JS, runs after Leaflet's global L is available
 * (Leaflet is loaded in layouts/layout.hbs).
 */
(function () {
  if (typeof window === "undefined" || typeof window.L === "undefined") return;

  var mapEl = document.getElementById("cafe-map");
  var dataEl = document.getElementById("cafe-map-data");
  if (!mapEl || !dataEl) return;

  var mode = mapEl.getAttribute("data-mode") || "dashboard";
  var cafes = [];
  try {
    cafes = JSON.parse(dataEl.textContent || "[]") || [];
  } catch (_e) {
    cafes = [];
  }
  if (!Array.isArray(cafes)) cafes = [];

  // Default centre: Ireland, useful when there are no cafes yet.
  var DEFAULT_CENTRE = [53.4, -8.0];
  var DEFAULT_ZOOM = 6;
  var DETAIL_ZOOM = 15;
  var PICKER_COLOUR = "#f4b400";
  var DEFAULT_COLOUR = "#9db5b2";

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Inline SVG coffee bean. 24x32 viewBox; bottom of the bean sits over the
   * coordinate so the marker reads like a pin.
   */
  function beanSvg(colour) {
    var fill = colour || DEFAULT_COLOUR;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32" aria-hidden="true">' +
      '<g filter="url(#bean-shadow)">' +
      '<ellipse cx="12" cy="12" rx="9" ry="11" fill="' + fill + '"/>' +
      '<path d="M5 6 Q12 14 19 22" stroke="rgba(0,0,0,0.45)" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      "</g>" +
      '<defs><filter id="bean-shadow" x="-30%" y="-10%" width="160%" height="140%">' +
      '<feDropShadow dx="0" dy="1.2" stdDeviation="1.1" flood-color="rgba(0,0,0,0.45)"/>' +
      "</filter></defs>" +
      "</svg>"
    );
  }

  function beanIcon(colour, isPicker) {
    return window.L.divIcon({
      className: "bean-marker" + (isPicker ? " bean-marker--picker" : ""),
      html: beanSvg(colour),
      iconSize: [24, 32],
      iconAnchor: [12, 30],
      popupAnchor: [0, -28],
    });
  }

  function popupHtml(cafe) {
    var imageBlock = cafe.imageUrl
      ? '<div class="cafe-popup-image"><img src="' +
        escapeHtml(cafe.imageUrl) +
        '" alt=""></div>'
      : "";
    var category = cafe.category
      ? '<span class="cafe-popup-chip" style="background-color:' +
        escapeHtml(cafe.categoryColour || DEFAULT_COLOUR) +
        ';">' +
        escapeHtml(cafe.category) +
        "</span>"
      : "";
    var views = cafe.viewCount
      ? '<p class="cafe-popup-meta"><span class="icon"><i class="fas fa-eye"></i></span> ' +
        escapeHtml(cafe.viewCount) +
        " views</p>"
      : "";
    var link = cafe.id
      ? '<a class="cafe-popup-link" href="/cafes/' +
        encodeURIComponent(cafe.id) +
        '">View &rarr;</a>'
      : "";
    return (
      '<div class="cafe-popup">' +
      imageBlock +
      '<p class="cafe-popup-name">' + escapeHtml(cafe.name || "") + "</p>" +
      category +
      views +
      link +
      "</div>"
    );
  }

  function buildMap() {
    var first = cafes[0];
    var startCentre = first ? [first.latitude, first.longitude] : DEFAULT_CENTRE;
    var startZoom = mode === "detail" ? DETAIL_ZOOM : DEFAULT_ZOOM;
    var map = window.L.map("cafe-map", { scrollWheelZoom: true }).setView(startCentre, startZoom);

    // Warmer Voyager tile layer (free; OSM + CARTO attribution required).
    window.L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    ).addTo(map);

    return map;
  }

  function addCafeMarkers(map) {
    var markers = [];
    for (var i = 0; i < cafes.length; i++) {
      var c = cafes[i];
      if (typeof c.latitude !== "number" || typeof c.longitude !== "number") continue;
      var m = window.L.marker([c.latitude, c.longitude], {
        icon: beanIcon(c.categoryColour, false),
        title: c.name || "",
      });
      m.bindPopup(popupHtml(c));
      m.addTo(map);
      markers.push(m);
    }
    if (markers.length > 1) {
      var group = window.L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [40, 40] });
    } else if (markers.length === 1) {
      map.setView(markers[0].getLatLng(), mode === "detail" ? DETAIL_ZOOM : 13);
    }
    return markers;
  }

  function attachPicker(map) {
    var latInput = document.querySelector('input[name="latitude"]');
    var lonInput = document.querySelector('input[name="longitude"]');
    if (!latInput || !lonInput) return;
    var pickerMarker = null;
    map.on("click", function (e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      latInput.value = lat.toFixed(6);
      lonInput.value = lng.toFixed(6);
      if (pickerMarker) {
        pickerMarker.setLatLng(e.latlng);
      } else {
        pickerMarker = window.L.marker(e.latlng, {
          icon: beanIcon(PICKER_COLOUR, true),
          title: "Click submit to save",
        }).addTo(map);
      }
    });
  }

  function init() {
    var map = buildMap();
    addCafeMarkers(map);
    if (mode === "picker") {
      attachPicker(map);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

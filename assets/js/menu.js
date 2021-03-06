/**
 * Created by Jean on 2019-10-09.
 */

var Menu = {
  reorderMenu: function (menu) {
    $(menu).children().sort(function (a, b) {
      return a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase());
    }).appendTo(menu);
  },

  refreshTreasures: function () {
    $('.menu-hidden[data-type=treasure]').children('.collectible-wrapper').remove();

    Treasures.data.filter(function (item) {
      var collectibleElement = $('<div>').addClass('collectible-wrapper').attr('data-type', item.text);
      var collectibleTextElement = $('<p>').addClass('collectible').text(Language.get(item.text));

      if (!Treasures.enabledTreasures.includes(item.text))
        collectibleElement.addClass('disabled');

      $('.menu-hidden[data-type=treasure]').append(collectibleElement.append(collectibleTextElement));
    });
  }
};

Menu.refreshMenu = function () {
  $('.menu-hidden[data-type]').children('.collectible-wrapper').remove();
  var anyUnavailableCategories = [];

  $.each(MapBase.markers, function (_key, marker) {
    // Only add subdata markers once.
    if (marker.subdata && $(`.menu-hidden[data-type=${marker.category}]`).children(`[data-type=${marker.subdata}]`).length > 0) return;

    var collectibleKey = marker.text;
    var collectibleText = null;
    var collectibleTitle = marker.title;
    var collectibleImage = null;

    if (marker.subdata) {
      collectibleText = marker.subdata;
      collectibleImage = $('<img>').attr('src', `./assets/images/icons/game/${collectibleKey}.png`).addClass('collectible-icon');
    } else {
      collectibleText = marker.text;
    }

    var collectibleElement = $('<div>').addClass('collectible-wrapper').attr('data-help', 'item').attr('data-type', collectibleText);
    var collectibleTextWrapperElement = $('<span>').addClass('collectible-text');
    var collectibleTextElement = $('<p>').addClass('collectible').text(collectibleTitle);

    collectibleElement.on('contextmenu', function (event) {
      if ($.cookie('right-click') != null)
        return;

      event.preventDefault();
    });

    var collectibleCategory = $(`.menu-option[data-type=${marker.category}]`);
    if (marker.lat && marker.lat.length == 0) {
      if (!anyUnavailableCategories.includes(marker.category))
        anyUnavailableCategories.push(marker.category);

      collectibleElement.attr('data-help', 'item_unavailable').addClass('not-found');
      collectibleCategory.attr('data-help', 'item_category_unavailable_items').addClass('not-found');
    }

    if (collectibleCategory.hasClass('not-found') && !anyUnavailableCategories.includes(marker.category))
      collectibleCategory.attr('data-help', 'item_category').removeClass('not-found');

    if (marker.subdata) {
      var currentSubdataMarkers = MapBase.markers.filter(function (_marker) {
        if (marker.subdata != _marker.subdata)
          return false;

        return true;
      });

      if (currentSubdataMarkers.every(function (marker) { return !marker.canCollect; }))
        collectibleElement.addClass('disabled');
    } else {
      if (!marker.canCollect)
        collectibleElement.addClass('disabled');
    }

    collectibleElement.hover(function (e) {
      var language = Language.get(`help.${$(this).data('help')}`);
      $('#help-container p').text(language);
    }, function () {
      $('#help-container p').text(Language.get(`help.default`));
    });

    $(`.menu-hidden[data-type=${marker.category}]`).append(collectibleElement.append(collectibleImage).append(collectibleTextWrapperElement.append(collectibleTextElement)));
  });

  Menu.refreshTreasures();

  $.each(categoriesDisabledByDefault, function (key, value) {
    if (value.length > 0) {
      $('[data-type=' + value + ']').addClass('disabled');
    }
  });

  $.each(plantsDisabledByDefault, function (key, value) {
    if (value.length > 0) {
      $('[data-type=' + value + ']').addClass('disabled');
    }
  });

  Menu.reorderMenu('#random_encounters');
  Menu.reorderMenu('.menu-hidden[data-type=animals]');
  Menu.reorderMenu('.menu-hidden[data-type=birds]');
  Menu.reorderMenu('.menu-hidden[data-type=fish]');
  Menu.reorderMenu('.menu-hidden[data-type=plants]');
  Menu.reorderMenu('.menu-hidden[data-type=treasure]');

  MapBase.loadImportantItems();
};

Menu.showAll = function () {
  $.each(categoryButtons, function (key, value) {
    $(value).removeClass("disabled");
    $(`.menu-hidden[data-type=${$(value).attr('data-type')}]`).removeClass("disabled");
  });

  enabledCategories = categories;

  MapBase.addMarkers();
  Treasures.addToMap();
  Encounters.addToMap();
};

Menu.hideAll = function () {
  $.each(categoryButtons, function (key, value) {
    $(value).addClass("disabled");
    $(`.menu-hidden[data-type=${$(value).attr('data-type')}]`).addClass("disabled");
  });

  enabledCategories = [];

  MapBase.addMarkers();
  Treasures.addToMap();
  Encounters.addToMap();
  Heatmap.removeHeatmap(true);
};

// Auto fill debug markers inputs, when "show coordinates on click" is enabled
Menu.liveUpdateDebugMarkersInputs = function (lat, lng) {
  $('#debug-marker-lat').val(lat);
  $('#debug-marker-lng').val(lng);
}

// Remove highlight from all important items
$('#clear_highlights').on('click', function () {
  var tempArray = MapBase.itemsMarkedAsImportant;
  $.each(tempArray, function () {
    MapBase.highlightImportantItem(tempArray[0]);
  });
});
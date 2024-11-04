$(function () { // То же самое, что и document.addEventListener("DOMContentLoaded"...
  
  // То же самое, что и document.querySelector("#navbarToggle").addEventListener("blur",...
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
});

(function (global) {

var dc = {};

var homeHtmlUrl = "snippets/home-snippet.html";
var allCategoriesUrl =
  "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemsUrl =
  "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";

// Вспомогательная функция для вставки innerHTML для 'selector'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Показать значок загрузки в элементе, идентифицированном 'selector'.
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

// Возвращает замену '{{propName}}' на propValue в строке
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};

// Убирает класс 'active' с кнопки Home и добавляет его на кнопку Menu
var switchMenuToActive = function () {
  // Убираем 'active' с кнопки Home
  var classes = document.querySelector("#navHomeButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#navHomeButton").className = classes;

  // Добавляем 'active' на кнопку Menu, если ее там нет
  classes = document.querySelector("#navMenuButton").className;
  if (classes.indexOf("active") === -1) {
    classes += " active";
    document.querySelector("#navMenuButton").className = classes;
  }
};

// При загрузке страницы (до загрузки изображений или CSS)
document.addEventListener("DOMContentLoaded", function (event) {

  // На первой загрузке показываем домашнюю страницу
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowHomeHTML, // Здесь вызываем buildAndShowHomeHTML
    true); // Устанавливаем флаг для получения JSON с сервера
});

// Построить HTML для домашней страницы на основе массива категорий,
// возвращенного сервером.
function buildAndShowHomeHTML (categories) {

  // Загружаем HTML-шаблон для домашней страницы
  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function (homeHtml) {
      
      // Шаг 2: Выбираем случайную категорию и сохраняем ее короткое имя
      var chosenCategory = chooseRandomCategory(categories);
      var chosenCategoryShortName = chosenCategory.short_name;

      // Шаг 3: Заменяем {{randomCategoryShortName}} на случайную категорию
      var homeHtmlToInsertIntoMainPage = insertProperty(homeHtml, "randomCategoryShortName", "'" + chosenCategoryShortName + "'");

      // Шаг 4: Вставляем обновленный HTML на главную страницу
      insertHtml("#main-content", homeHtmlToInsertIntoMainPage);

    },
    false); // False здесь, так как получаем обычный HTML (не JSON).
}

// Данная функция принимает массив объектов категорий и возвращает случайную категорию
function chooseRandomCategory (categories) {
  // Выбираем случайный индекс в массиве
  var randomArrayIndex = Math.floor(Math.random() * categories.length);

  // Возвращаем категорию с этим индексом
  return categories[randomArrayIndex];
}

// Загрузка представления категорий меню
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowCategoriesHTML);
};

// Загрузка представления пунктов меню
// 'categoryShort' - это сокращенное название категории
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    menuItemsUrl + categoryShort + ".json",
    buildAndShowMenuItemsHTML);
};

// Построить HTML для страницы категорий на основе данных
// с сервера
function buildAndShowCategoriesHTML (categories) {
  // Загружаем HTML-шаблон заголовка страницы категорий
  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function (categoriesTitleHtml) {
      // Загружаем HTML-шаблон одной категории
      $ajaxUtils.sendGetRequest(
        categoryHtml,
        function (categoryHtml) {
          // Переключаем CSS класс active на кнопку меню
          switchMenuToActive();

          var categoriesViewHtml =
            buildCategoriesViewHtml(categories,
                                    categoriesTitleHtml,
                                    categoryHtml);
          insertHtml("#main-content", categoriesViewHtml);
        },
        false);
    },
    false);
}

// Используем данные о категориях и HTML-шаблоны
// для построения представления категорий, которое вставляем на страницу
function buildCategoriesViewHtml(categories,
                                 categoriesTitleHtml,
                                 categoryHtml) {

  var finalHtml = categoriesTitleHtml;
  finalHtml += "<section class='row'>";

  // Цикл по всем категориям
  for (var i = 0; i < categories.length; i++) {
    // Вставляем значения категории
    var html = categoryHtml;
    var name = "" + categories[i].name;
    var short_name = categories[i].short_name;
    html =
      insertProperty(html, "name", name);
    html =
      insertProperty(html,
                     "short_name",
                     short_name);
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

// Построить HTML для страницы одной категории на основе данных
// с сервера
function buildAndShowMenuItemsHTML (categoryMenuItems) {
  // Загружаем HTML-шаблон заголовка страницы пунктов меню
  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {
      // Загружаем HTML-шаблон одного пункта меню
      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {
          // Переключаем CSS класс active на кнопку меню
          switchMenuToActive();

          var menuItemsViewHtml =
            buildMenuItemsViewHtml(categoryMenuItems,
                                   menuItemsTitleHtml,
                                   menuItemHtml);
          insertHtml("#main-content", menuItemsViewHtml);
        },
        false);
    },
    false);
}

// Используем данные о категории и пунктах меню, а также HTML-шаблоны
// для построения представления пунктов меню, которое вставляем на страницу
function buildMenuItemsViewHtml(categoryMenuItems,
                                menuItemsTitleHtml,
                                menuItemHtml) {

  menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                   "name",
                   categoryMenuItems.category.name);
  menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                   "special_instructions",
                   categoryMenuItems.category.special_instructions);

  var finalHtml = menuItemsTitleHtml;
  finalHtml += "<section class='row'>";

  // Цикл по всем пунктам меню
  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;
  for (var i = 0; i < menuItems.length; i++) {
    // Вставляем значения пункта меню
    var html = menuItemHtml;
    html =
      insertProperty(html, "short_name", menuItems[i].short_name);
    html =
      insertProperty(html,
                     "catShortName",
                     catShortName);
    html =
      insertItemPrice(html,
                      "price_small",
                      menuItems[i].price_small);
    html =
      insertItemPortionName(html,
                            "small_portion_name",
                            menuItems[i].small_portion_name);
    html =
      insertItemPrice(html,
                      "price_large",
                      menuItems[i].price_large);
    html =
      insertItemPortionName(html,
                            "large_portion_name",
                            menuItems[i].large_portion_name);
    html =
      insertProperty(html,
                     "name",
                     menuItems[i].name);
    html =
      insertProperty(html,
                     "description",
                     menuItems[i].description);

    // Добавляем clearfix после каждого второго пункта меню
    if (i % 2 !== 0) {
      html +=
        "<div class='clearfix visible-lg-block visible-md-block'></div>";
    }

    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

// Добавляем символ '$' к цене, если она задана
function insertItemPrice(html,
                         pricePropName,
                         priceValue) {
  // Если цена не задана, заменяем на пустую строку
  if (!priceValue) {
    return insertProperty(html, pricePropName, "");
  }

  priceValue = "$" + priceValue.toFixed(2);
  html = insertProperty(html, pricePropName, priceValue);
  return html;
}

// Добавляем размер порции, если он задан
function insertItemPortionName(html,
                               portionPropName,
                               portionValue) {
  // Если размер порции не задан, заменяем на пустую строку
  if (!portionValue) {
    return insertProperty(html, portionPropName, "");
  }

  portionValue = "(" + portionValue + ")";
  html = insertProperty(html, portionPropName, portionValue);
  return html;
}

global.$dc = dc;

})(window);

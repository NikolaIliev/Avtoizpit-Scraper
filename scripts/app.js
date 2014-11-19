/* global require, console, alert */

require.config({
  paths: {
    "jquery": "../bower_components/jquery/dist/jquery",
    "handlebars": "../bower_components/handlebars/handlebars",
    "bootstrap": "../bower_components/bootstrap/dist/js/bootstrap"
  },
  shim: {
    "handlebars": {
      exports: "Handlebars"
    },
    "bootstrap": {
        "deps": ["jquery"]
    }
  }
});


require(["jquery", "handlebars", "bootstrap"], function($, Handlebars) {
  "use strict";

  function reloadUI(data) {
    var
      templateString = $("#table-template").html(),
      compiledTemplate = Handlebars.compile(templateString),
      html = compiledTemplate({
        data: data
      });

      $("body").html(html);
  }

  function fetchQuestions() {
    $.ajax({
      type: "GET",
      url: "http://localhost:3010/questions",
      data: {
        count: $(".question-wrapper").length + 100
      }
    })
    .done(function(questions) {
      reloadUI(questions);
    })
    .fail(function(error) {
      console.log(error);
    });
  }

  $(document).on("click", "#next-button", function () {
    console.log("IN");
    fetchQuestions();
  });

  $(document).on("click", ".question-wrapper", function () {
    $('.answer', this).each(function () {
      $(this).addClass($(this).attr('istrue'));
    });
  });

  fetchQuestions();
});
const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");
const lazyImagesPlugin = require("eleventy-plugin-lazyimages");
const fs = require("fs");
const { minify } = require("terser");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight"); // paste code :D
const pluginRss = require("@11ty/eleventy-plugin-rss"); //RSS feed
const pluginSEO = require("eleventy-plugin-seo"); // SEO - also provides social preview images
const blogTools = require("eleventy-plugin-blog-tools"); // youtube and others
const yaml = require("js-yaml"); // use yaml files

const md = require("markdown-it")({
  html: false,
  breaks: true,
  linkify: true,
}); // transform yaml files in markdown

const Image = require("@11ty/eleventy-img");

module.exports = function (cfg) {
  cfg.addPassthroughCopy("styles");
  cfg.addPassthroughCopy("images");
  cfg.addPassthroughCopy("js");
  cfg.addPassthroughCopy("admin");
  cfg.addFilter("readtime", require("./lib/filters/readtime"));
  cfg.addPlugin(pluginRss); //RSS feed
  cfg.addPlugin(syntaxHighlight); // paste code :D
  cfg.addPlugin(blogTools); // youtube and others
  cfg.addDataExtension("yaml", (contents) => yaml.safeLoad(contents)); // use yaml files
  cfg.addNunjucksFilter("markdownify", (markdownString) =>
    md.render(markdownString)
  ); // transform yaml files in markdown

  cfg.addJavaScriptFunction("myImage", function (src, alt, options) {
    // returns Promise
    return Image(src, options);
  });

  cfg.addPlugin(lazyImagesPlugin, {
    imgSelector: "img", // custom image selector
    cacheFile: ".lazyimages.json", // don't cache results to a file
  });

  cfg.setBrowserSyncConfig({
    // scripts in body conflict with Turbolinks
    snippetOptions: {
      rule: {
        match: /<\/head>/i,
        fn: function (snippet, match) {
          return snippet + match;
        },
      },
    },
  });

  cfg.addPlugin(pluginSEO, {
    title: "HCR2 Clan Portugal",
    description: "O site oficial do Clan Portugal HCR2. Junta-te a nós!",
    url: "https://clanportugal.tk/",
    author: "Narciso Ornelas",
    // twitter: "Narciso Ornelas",
    //image: "cat.jpg"
  });

  // javascript minify
  cfg.addNunjucksAsyncFilter("jsmin", async function (code, callback) {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.error("Terser error: ", err);
      // Fail gracefully.
      callback(null, code);
    }
  });

  // html minify
  cfg.addTransform("htmlmin", (content, outputPath) => {
    if (outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        useShortDoctype: true,
      });
    }

    return content;
  });
  cfg.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });
  cfg.addPlugin(eleventyPluginFilesMinifier);

  // 404
  cfg.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, bs) {
        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync("_site/404.html");
          res.write(content_404);
          res.writeHead(404);
          res.end();
        });
      },
    },
  });
};

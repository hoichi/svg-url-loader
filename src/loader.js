/*
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 * @author  Hovhannes Babayan <bhovhannes at gmail dot com>
 */
var loaderUtils = require('loader-utils');

var REGEX_STYLE = /<style[\s\S]*?>[\s\S]*?<\/style>/i
var REGEX_DECLARATION = /^\s*<\?xml [^>]*>\s*/i

var REGEX_DOUBLE_QUOTE = /"/g
var REGEX_MULTIPLE_SPACES = /\s+/g
var REGEX_UNSAFE_CHARS = /[{}\|\\\^~\[\]`"<>#%]/g

module.exports = function(content) {

	this.cacheable && this.cacheable();

	var query = loaderUtils.getOptions(this) || {};
	query.encoding = query.encoding || "none";


	if (this.resourcePath.search(query.exclude || /^\b$/) > -1) {
		// here’s a transparent pixel
		return 'module.exports = ' + JSON.stringify(
			"data:image/gif;base64,"
			+ "R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
		);
	}

	var limit = query.limit ? parseInt(query.limit, 10) : 0;

	if (limit <= 0 || content.length < limit) {
		var newContent = content.toString('utf8');

		var hasStyleElement = REGEX_STYLE.test(newContent)

		if (!('stripdeclarations' in query) || query.stripdeclarations) {
			newContent = newContent.replace(REGEX_DECLARATION, "");
		}
		newContent = newContent.replace(REGEX_MULTIPLE_SPACES, " ");

		var data;
		if (query.encoding === "base64") {
			if (typeof newContent === "string") {
				newContent = new Buffer(newContent);
			}
			data = "data:image/svg+xml;base64," + newContent.toString("base64");
		} else {
			newContent = newContent.replace(REGEX_DOUBLE_QUOTE, "'");
			newContent = newContent.replace(REGEX_UNSAFE_CHARS, function(match) {
				return '%'+match[0].charCodeAt(0).toString(16).toUpperCase();
			});

			data = 'data:image/svg+xml,' + newContent.trim();
		}

		if (!(query.iesafe && hasStyleElement && data.length > 4096)) {
			return 'module.exports = ' + JSON.stringify(data);
		}
	}

	var fileLoader = require('file-loader');
	var childContext = Object.create(this)
	childContext.query = Object.assign({}, query)
	childContext.query.esModule = false
	return fileLoader.call(childContext, content);
};

module.exports.raw = true;

(function ($, ns, channel, window, undefined) {

    var DIALOG_LINK_CHECKER_URL = "/bin/aemtrickslinkchecker";

    var getLinksFromRichText = function(rteContent) {
        var links = [];
        rteContent.replace(/[^<]*(href="([^"]+)"([^<]+))/g, function () {
            links.push(Array.prototype.slice.call(arguments, 1, 4)[1]);
        });
        return links;
    };

    var getLinkCheckerResponse = function (link) {
        var response = '';
        $.ajax({
            dataType: "json",
            url: DIALOG_LINK_CHECKER_URL + "?url=" + link,
            async: false,
            success: function (data) {
                response = data;
            }
        });
        return response;
    };

    var getValidationMessage = function(url){
        var message = '',
            linkCheckerResponse = getLinkCheckerResponse(url);

        if (linkCheckerResponse.exists == false) {
            if (linkCheckerResponse.pageType == "internal") {
                message = '<b>' + url + '</b>' + ' is not correct internal page.</br>';
            }
            else {
                message = '<b>' + url + '</b>' + ' is not correct external page.</br>';
            }
        }

        return message;
    };

    var displayMessageBox = function(message, editor, editable){
        ns.ui.helpers.prompt({
            title: Granite.I18n.get("Invalid URL"),
            message: message,
            actions: [
                {
                    id: "CANCEL",
                    text: "Cancel",
                    className: "coral-Button "
                },
                {
                    id: "PROCEED_ANYWAY",
                    text: "Proceed anyway",
                    className: "coral-Button--warning"
                }
            ],
            callback: function (actionId) {
                if (actionId !== "PROCEED_ANYWAY") {
                    editor.startInlineEdit.call(editor, editable);
                }
            }
        });
    };

    var validateRichTextLinks = function(editable, editor) {
        var rteContent = editable.dom.html(),
            links = getLinksFromRichText(rteContent),
            message = '';

        links.forEach(function (link) {
            message += getValidationMessage(link);
        });

        if (message.length > 0) {
           displayMessageBox(message, editor, editable);
        }
    };


    ns.editor.AemTricksInlineEditor = function() {
        var self = this;
        channel.on("inline-edit-start", function(e) {
            var editable = e.editable;
            self.startInlineEdit(editable);
        });
    };

    ns.editor.AemTricksInlineEditor.prototype.parent = new ns.editor.InlineTextEditor('text');

    ns.editor.AemTricksInlineEditor.prototype.setUp = function (editable) {
        this.parent.setUp.call(this, editable);
    };

    ns.editor.AemTricksInlineEditor.prototype.tearDown = function (editable) {
        this.parent.tearDown.call(this, editable);
    };

    ns.editor.AemTricksInlineEditor.prototype.startInlineEdit = function(editable) {
        this.parent.startInlineEdit.call(this,editable);
    };

    ns.editor.AemTricksInlineEditor.prototype.finishInlineEdit = function(editable, changedContent, preventModeChange) {
        this.parent.finishInlineEdit.call(this, editable, changedContent, preventModeChange);
        validateRichTextLinks(editable, this);
    };

    ns.editor.AemTricksInlineEditor.prototype.notifyInitialHistoryContent = function(path, initialContent) {
        this.parent.notifyInitialHistoryContent.call(this, path, initialContent);
    };

    ns.editor.AemTricksInlineEditor.prototype.addHistoryStep = function(editable, persistedContent) {
        this.parent.addHistoryStep.call(this, editable, persistedContent);
    };

    ns.editor.AemTricksInlineEditor.prototype.cancelInlineEdit = function(editable, preventModeChange) {
       this.parent.cancelInlineEdit.call(this, editable, preventModeChange);
    };

    // register the editor to the editor registry
    ns.editor.register('aemTricksText', new ns.editor.AemTricksInlineEditor());

}(jQuery, Granite.author, jQuery(document), this));
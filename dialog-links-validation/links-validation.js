var Validation = {

    DIALOG_LINK_CHECKER_URL : "/bin/aemtrickslinkchecker",

    validateDialogLinks: function(document, $, ns, $okButton, onSubmit)
    {
        var that = this;

        var getLinkCheckerResponse = function (link) {
            var response = '';
            $.ajax({
                dataType: "json",
                url: that.DIALOG_LINK_CHECKER_URL + "?url=" + link,
                async: false,
                success: function (data) {
                    response = data;
                }
            });
            return response;
        };

        var getLinksFromRichText = function(rteContent) {
            var links = [];
            rteContent.replace(/[^<]*(href="([^"]+)"([^<]+))/g, function () {
                links.push(Array.prototype.slice.call(arguments, 1, 4)[1]);
            });
            return links;
        };

        var getValidationMessage = function(url, labelName){
            var message = '',
                linkCheckerResponse = getLinkCheckerResponse(url);

            if (linkCheckerResponse.exists == false) {
                if (linkCheckerResponse.pageType == "internal") {
                    message = '<b>' + labelName + '</b>' + ' field URL is not correct internal page: ' + url + '<br/>';
                }
                else {
                    message = '<b>' + labelName + '</b>' + ' field URL is not correct external page: ' + url + '<br/>';
                }
            }

            return message;
        };

        var displayValidationMessage = function(message) {
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
                    if (actionId === "PROCEED_ANYWAY") {
                        onSubmit();
                    }
                }
            });
        };

        var $form = $okButton.closest("form.foundation-form"),
            dialogFields = $form.find('[data-init=pathbrowser] [name], .richtext-container > .coral-Textfield[name]'),
            message = '';
        for (var i = 0; i < dialogFields.length; ++i) {
            var dialogField = dialogFields.eq(i),
                dialogFieldValue = dialogField.val(),
                isEmpty = dialogFieldValue.length == 0,
                isHidden = dialogField.closest('.hide').length > 0;
            if (!isEmpty && ! isHidden) {
                var isRichText = dialogField.parent().hasClass('richtext-container');
                if (isRichText) {
                    var labelName = dialogField.attr('title') || dialogField.closest('.coral-Form-fieldwrapper').find('.coral-Form-fieldlabel').text();
                    var links = getLinksFromRichText(dialogFieldValue);

                    links.forEach(function (link) {
                        message += getValidationMessage(link, labelName);
                    })
                }
                else {
                    var labelName= dialogField.closest('.coral-Form-fieldwrapper').find('label').text();
                    message += getValidationMessage(dialogFieldValue, labelName);
                }
            }
        }

        if (message.length > 0) {
            displayValidationMessage(message);
        }else{
            onSubmit();
        }
    }
};

$(document).ready(function () {

    var linkCheckingEnabled = false;

    /** this is fix for rte configuration in dialog **/
    var setUpRichtextConfiguration = function() {
        $(".editable,.coral-RichText-editable").each(function() {
            var editable = $(this),
                input = editable.parent().children('input'),
                config = input.data('config-path');

            if (config !== undefined && config.length > 0) {
                editable.attr('data-config-path',config);
            }

        });
    }

    $(document).on("dialog-ready", function () {
        linkCheckingEnabled = true;
        setUpRichtextConfiguration();
    });

    $(document).on("click", ".cq-dialog-submit", function (e) {
        if (linkCheckingEnabled) {
            var $okButton = $(this),
                $form = $okButton.closest("form.foundation-form");
            e.stopPropagation();
            e.preventDefault();

            Validation.validateDialogLinks(document, Granite.$, Granite.author, $okButton, function () {
                linkCheckingEnabled = false;
                $okButton.click();
            });
        }
    });

});


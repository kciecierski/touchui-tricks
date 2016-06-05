package org.aem.tricks.core.impl.servlets.linkchecker;

import com.google.gson.annotations.Expose;

public enum DialogLinkCheckerResponseType {

    INTERNAL_PAGE_EXISTS("internal", true), //
    INTERNAL_PAGE_NOT_EXISTS("internal", false), //
    EXTERNAL_PAGE_EXISTS("external", true), //
    EXTERNAL_PAGE_NOT_EXISTS("external", false);


    @Expose
    private final String pageType;

    @Expose
    private final boolean exists;


    DialogLinkCheckerResponseType(String pageType, final boolean exists) {
        this.pageType = pageType;
        this.exists = exists;
    }

    public DialogLinkCheckerResponse getLinkCheckerResponse() {
        return new DialogLinkCheckerResponse(pageType, exists);
    }
}

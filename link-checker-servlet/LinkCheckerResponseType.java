package org.aem.tricks.core.impl.servlets.linkchecker;

import com.google.gson.annotations.Expose;

public enum LinkCheckerResponseType {

    INTERNAL_PAGE_EXISTS("internal", true), //
    INTERNAL_PAGE_NOT_EXISTS("internal", false), //
    EXTERNAL_PAGE_EXISTS("external", true), //
    EXTERNAL_PAGE_NOT_EXISTS("external", false);


    @Expose
    private final String pageType;

    @Expose
    private final boolean exists;


    LinkCheckerResponseType(String pageType, final boolean exists) {
        this.pageType = pageType;
        this.exists = exists;
    }

    public LinkCheckerResponse getLinkCheckerResponse() {
        return new LinkCheckerResponse(pageType, exists);
    }
}

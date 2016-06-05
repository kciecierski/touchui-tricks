package org.aem.tricks.core.impl.servlets.linkchecker;

public class LinkCheckerResponse {

    private final String pageType;

    private final boolean exists;

    public LinkCheckerResponse(String pageType, boolean exists) {
        this.pageType = pageType;
        this.exists = exists;
    }

    public String getPageType() {
        return pageType;
    }

    public boolean getExists() {
        return exists;
    }
}

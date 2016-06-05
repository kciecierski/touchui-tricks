package org.aem.tricks.core.impl.servlets.linkchecker;

public class DialogLinkCheckerResponse {

    private final String pageType;

    private final boolean exists;

    public DialogLinkCheckerResponse(String pageType, boolean exists) {
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

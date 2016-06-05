package org.aem.tricks.core.impl.servlets.linkchecker;

import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.net.URL;
import java.util.Dictionary;

import org.apache.commons.lang.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.sling.SlingServlet;
import org.apache.jackrabbit.oak.commons.IOUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;

import com.google.gson.Gson;

@SlingServlet(paths = "/bin/dialoglinkchecker", methods = "GET", metatype = true)
@Properties({ //
        @Property(name = DialogLinkCheckerServlet.EXTERNAL_PAGE_CONNECTION_PROPERTY, boolValue = true,
            propertyPrivate = false, description = "Check this if connection to www is available for AEM instance") //
})
public class DialogLinkCheckerServlet extends SlingSafeMethodsServlet {

    protected static final String EXTERNAL_PAGE_CONNECTION_PROPERTY = "externalPageConnection";

    private static final boolean EXTERNAL_PAGE_CONNECTION_DEFAULT_VALUE = true;

    private static final String VALIDATED_URL_PARAMETER_NAME = "url";

    private static final String ANCHOR_PREFIX = "#";

    private static final String QUERY_PREFIX = "?";

    private static final String INTERNAL_LINK_PREFIX = "/";

    private static final String JSON_CONTENT_TYPE = "application/json";

    private static final String UTF_8_ENCODING = "UTF-8";

    @Reference
    private ConfigurationAdmin configAdmin;

    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        final String validatedUrl = request.getParameter(VALIDATED_URL_PARAMETER_NAME);

        if (isInternalLink(validatedUrl)) {
            writeLinkCheckerResponse(response,
                    internalPageExists(request, validatedUrl) ? DialogLinkCheckerResponseType.INTERNAL_PAGE_EXISTS
                            : DialogLinkCheckerResponseType.INTERNAL_PAGE_NOT_EXISTS);
        } else if (externalPageExists(validatedUrl)) {
            writeLinkCheckerResponse(response, DialogLinkCheckerResponseType.EXTERNAL_PAGE_EXISTS);
        } else if (isAnchorOrQueryParameter(validatedUrl)) {
            writeLinkCheckerResponse(response, DialogLinkCheckerResponseType.EXTERNAL_PAGE_EXISTS);
        } else {
            writeLinkCheckerResponse(response, DialogLinkCheckerResponseType.EXTERNAL_PAGE_NOT_EXISTS);
        }
    }

    private boolean internalPageExists(SlingHttpServletRequest request, String url) {
        final ResourceResolver resourceResolver = request.getResourceResolver();
        return resourceResolver.getResource(url) != null;
    }

    private boolean isAnchorOrQueryParameter(final String url) {
        return StringUtils.startsWith(url, ANCHOR_PREFIX) || StringUtils.startsWith(url, QUERY_PREFIX);
    }

    private boolean externalPageExists(final String url) {
        InputStream inputstream = null;
        try {
            URL externalUrl = new URL(url); // this throws Malformed URL exception if url syntax is not valid
            if (isExternalPageConnectionEnabled()) {
                inputstream = externalUrl.openStream(); // this throws exception if cannot connect to page
            }
            return true;

        } catch (final IOException e) {
            return false;
        } finally {
            IOUtils.closeQuietly(inputstream);
        }
    }

    private Boolean isExternalPageConnectionEnabled() throws IOException {
        final String servletName = this.getClass().getCanonicalName();
        final Configuration servletConfiguration = configAdmin.getConfiguration(servletName);
        Dictionary properties = servletConfiguration.getProperties();
        if (properties != null) {
            final Boolean externalPageConnectionEnabled = (Boolean) servletConfiguration.getProperties()
                    .get(EXTERNAL_PAGE_CONNECTION_PROPERTY);
            return BooleanUtils.toBooleanDefaultIfNull(externalPageConnectionEnabled, false);
        } else {
            return EXTERNAL_PAGE_CONNECTION_DEFAULT_VALUE;
        }
    }

    private boolean isInternalLink(final String url) {
        return StringUtils.startsWith(url, INTERNAL_LINK_PREFIX);
    }

    private void writeLinkCheckerResponse(final SlingHttpServletResponse servletResponse,
            final DialogLinkCheckerResponseType dialogLinkCheckerResponseType) throws IOException {
        servletResponse.setContentType(JSON_CONTENT_TYPE);
        servletResponse.setCharacterEncoding(UTF_8_ENCODING);
        final Gson gson = new Gson();
        final String jsonResponse = gson.toJson(dialogLinkCheckerResponseType.getLinkCheckerResponse());
        final Writer writer = servletResponse.getWriter();
        writer.write(jsonResponse);
        writer.flush();
        servletResponse.flushBuffer();
    }
}
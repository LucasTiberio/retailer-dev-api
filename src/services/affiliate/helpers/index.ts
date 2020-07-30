const vtexUtmSource = "plugone_affiliate";

export const generateVtexShortener = (
  originalUrl: string,
  hasQueryString: boolean,
  affiliateId: string,
  organizationId: string
) => {
  const urlWithMemberAttached = `${originalUrl}${
    hasQueryString ? "&" : "?"
  }utm_source=${vtexUtmSource}&utm_campaign=${affiliateId}_${organizationId}`;

  return urlWithMemberAttached;
};

export const generateLojaIntegradaShortener = (
  originalUrl: string,
  hasQueryString: boolean,
  affiliateId: string,
  organizationId: string
) => {
  const urlWithMemberAttached = `${originalUrl}${
    hasQueryString ? "&" : "?"
  }utm_campaign=plugone-affiliate_${affiliateId}_${organizationId}`;

  return urlWithMemberAttached;
};

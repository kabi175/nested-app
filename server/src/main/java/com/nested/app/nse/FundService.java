package com.nested.app.nse;

/**
 * Service to refresh fund details from NSE.
 * Use nsemfdesk/api/v2/reports/MASTER_DOWNLOAD
 */
public interface FundService {
    void refreshDetails();
}

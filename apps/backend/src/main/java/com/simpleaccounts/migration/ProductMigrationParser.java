package com.simpleaccounts.migration;

import com.simpleaccounts.migration.xml.bindings.applicationmigration.ApplicationMigration;
import com.simpleaccounts.migration.xml.bindings.product.Product;
import com.simpleaccounts.utils.FileHelper;
import java.io.File;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;
import lombok.extern.slf4j.Slf4j;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@Slf4j
public class ProductMigrationParser {

    public static String applicationMigrationXML = "ApplicationMigration.xml";

    private static ApplicationMigration applicationMigration = null;

    private static String applicationMigrationPackage = "com.simpleaccounts.migration.xml.bindings.applicationmigration";
    private static String ProductPackage = "com.simpleaccounts.migration.xml.bindings.product";

    private static Map<String, Product> appVersionsToProductMap;

    public static Map<String, Product> getAppVersionsToProductMap() {
        return appVersionsToProductMap;
    }

    private static ProductMigrationParser productMigrationParser = new ProductMigrationParser();

    public static ProductMigrationParser getInstance(){
        return productMigrationParser;
    }

    private ProductMigrationParser() {

                boolean loaded = init();

    }

    private static boolean init() {
        try{
            applicationMigration = (ApplicationMigration) loadXML(applicationMigrationPackage, applicationMigrationXML);

            try{
                if(applicationMigration != null){
                    List<ApplicationMigration.ApplicationList.Application> productList = applicationMigration.getApplicationList().getApplication();
                    for(ApplicationMigration.ApplicationList.Application application : productList){
                        List<BigDecimal> versionList = application.getVersionList().getVersion();
                        for(BigDecimal version:versionList){
                            String productVersionXML = application.getName() + "_v" + version + ".xml";
                            com.simpleaccounts.migration.xml.bindings.product.Product productVersion =
                                    (com.simpleaccounts.migration.xml.bindings.product.Product) loadXML(ProductPackage, productVersionXML);

                            if(appVersionsToProductMap == null)
                                appVersionsToProductMap = new HashMap<String, Product> ();

                            appVersionsToProductMap.put(application.getName() + "_v" + version,productVersion);
                        }
                    }
                }
            }
            catch (Exception ie){
                log.error(ERROR, ie);
            }
        }
        catch (Exception e) {
            log.error(ERROR, e);
            return false;
        }
        return true;
    }

    /**
     * This method loads xml file
     * @param packageString
     * @param xmlName
     * @return
     */
    private static Object loadXML(String packageString, String xmlName)
    {
        Object retVal = null;
        try{
           String rootPath = FileHelper.getRootPath();
           log.info("insideLoadXML{}",rootPath);
            JAXBContext jc = JAXBContext.newInstance(packageString);
            Unmarshaller unmarshaller = jc.createUnmarshaller();
            String filename = System.getProperty("xml.folder.path",rootPath+"/resources/migration") + System.getProperty("file.separator") + xmlName;
            retVal = unmarshaller.unmarshal(new File(filename));
        }
        catch (Exception e){
            log.error(ERROR, e);
        }
        return retVal;
    }
}

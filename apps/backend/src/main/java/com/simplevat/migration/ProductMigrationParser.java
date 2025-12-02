package com.simplevat.migration;

import com.simplevat.migration.xml.bindings.applicationmigration.ApplicationMigration;
import com.simplevat.migration.xml.bindings.product.Product;
import com.simplevat.utils.FileHelper;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.simplevat.constant.ErrorConstant.ERROR;

@Slf4j
public class ProductMigrationParser {

    public static String applicationMigrationXML = "ApplicationMigration.xml";

    private static ApplicationMigration applicationMigration = null;
    private static boolean reload = Boolean.parseBoolean(System.getProperty("reload.prouct.migration","true"));;

    private static String applicationMigrationPackage = "com.simplevat.migration.xml.bindings.applicationmigration";
    private static String ProductPackage = "com.simplevat.migration.xml.bindings.product";

    private  final Logger logger = LoggerFactory.getLogger(ProductMigrationParser.class);

    private static Map<String, Product> appVersionsToProductMap;

    public static Map<String, Product> getAppVersionsToProductMap() {
        return appVersionsToProductMap;
    }

    private static ProductMigrationParser productMigrationParser = new ProductMigrationParser();

    public static ProductMigrationParser getInstance(){
        return productMigrationParser;
    }

    private ProductMigrationParser() {
//        if (reload){
//            synchronized(this){
                boolean loaded = init();
//                reload = false;
//            }
//        }
    }

    private boolean init() {
        try{
            applicationMigration = (ApplicationMigration) loadXML(applicationMigrationPackage, applicationMigrationXML);

            try{
                if(applicationMigration != null){
                    List<ApplicationMigration.ApplicationList.Application> productList = applicationMigration.getApplicationList().getApplication();
                    for(ApplicationMigration.ApplicationList.Application application : productList){
                        List<BigDecimal> versionList = application.getVersionList().getVersion();
                        for(BigDecimal version:versionList){
                            String productVersionXML = application.getName() + "_v" + version + ".xml";
                            com.simplevat.migration.xml.bindings.product.Product productVersion =
                                    (com.simplevat.migration.xml.bindings.product.Product) loadXML(ProductPackage, productVersionXML);

                            if(appVersionsToProductMap == null)
                                appVersionsToProductMap = new HashMap<String, Product> ();

                            appVersionsToProductMap.put(application.getName() + "_v" + version,productVersion);
                        }
                    }
                }
            }
            catch (Exception ie){
                logger.error(ERROR, ie);
            }
        }
        catch (Exception e) {
            logger.error(ERROR, e);
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
    private Object loadXML(String packageString, String xmlName)
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
            logger.error(ERROR, e);
        }
        return retVal;
    }
}

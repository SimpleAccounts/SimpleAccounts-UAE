//

package com.simpleaccounts.migration.xml.bindings.applicationmigration;

import javax.xml.bind.annotation.XmlRegistry;

/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the com.simpleaccounts.migration.xml.bindings.productmigration package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: com.simpleaccounts.migration.xml.bindings.productmigration
     *
     */
    public ObjectFactory() {
        // Intentionally empty - JAXB requires a public no-args constructor
    }

    /**
     * Create an instance of {@link ApplicationMigration }
     * 
     */
    public ApplicationMigration createApplicationMigration() {
        return new ApplicationMigration();
    }

    /**
     * Create an instance of {@link ApplicationMigration.ApplicationList }
     * 
     */
    public ApplicationMigration.ApplicationList createApplicationMigrationApplicationList() {
        return new ApplicationMigration.ApplicationList();
    }

    /**
     * Create an instance of {@link ApplicationMigration.ApplicationList.Application }
     * 
     */
    public ApplicationMigration.ApplicationList.Application createApplicationMigrationApplicationListApplication() {
        return new ApplicationMigration.ApplicationList.Application();
    }

    /**
     * Create an instance of {@link ApplicationMigration.ApplicationList.Application.VersionList }
     * 
     */
    public ApplicationMigration.ApplicationList.Application.VersionList createApplicationMigrationApplicationListApplicationVersionList() {
        return new ApplicationMigration.ApplicationList.Application.VersionList();
    }

}

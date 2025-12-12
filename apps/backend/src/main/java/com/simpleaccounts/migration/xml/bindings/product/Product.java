//

package com.simpleaccounts.migration.xml.bindings.product;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlValue;

/**
 * <p>Java class for anonymous complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="TableList">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="Table" maxOccurs="unbounded" minOccurs="0">
 *                     &lt;complexType>
 *                       &lt;complexContent>
 *                         &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                           &lt;sequence>
 *                             &lt;element name="ColumnList">
 *                               &lt;complexType>
 *                                 &lt;complexContent>
 *                                   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                                     &lt;sequence>
 *                                       &lt;element name="Column" maxOccurs="unbounded" minOccurs="0">
 *                                         &lt;complexType>
 *                                           &lt;simpleContent>
 *                                             &lt;extension base="&lt;http://www.w3.org/2001/XMLSchema>byte">
 *                                               &lt;attribute name="inputColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
 *                                               &lt;attribute name="simpeVatColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
 *                                               &lt;attribute name="setterMethod" type="{http://www.w3.org/2001/XMLSchema}string" />
 *                                             &lt;/extension>
 *                                           &lt;/simpleContent>
 *                                         &lt;/complexType>
 *                                       &lt;/element>
 *                                     &lt;/sequence>
 *                                   &lt;/restriction>
 *                                 &lt;/complexContent>
 *                               &lt;/complexType>
 *                             &lt;/element>
 *                           &lt;/sequence>
 *                           &lt;attribute name="name" type="{http://www.w3.org/2001/XMLSchema}string" />
 *                           &lt;attribute name="srcFileName" type="{http://www.w3.org/2001/XMLSchema}string" />
 *                           &lt;attribute name="entityName" type="{http://www.w3.org/2001/XMLSchema}string" />
 *                           &lt;attribute name="serviceName" type="{http://www.w3.org/2001/XMLSchema}string" />
 *                         &lt;/restriction>
 *                       &lt;/complexContent>
 *                     &lt;/complexType>
 *                   &lt;/element>
 *                 &lt;/sequence>
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *       &lt;/sequence>
 *       &lt;attribute name="name" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="version" type="{http://www.w3.org/2001/XMLSchema}float" />
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "tableList"
})
@XmlRootElement(name = "Product")
public class Product {

    @XmlElement(name = "TableList", required = true)
    protected Product.TableList tableList;
    @XmlAttribute(name = "name")
    protected String name;
    @XmlAttribute(name = "version")
    protected Float version;

    /**
     * Gets the value of the tableList property.
     * 
     * @return
     *     possible object is
     *     {@link Product.TableList }
     *     
     */
    public Product.TableList getTableList() {
        return tableList;
    }

    /**
     * Sets the value of the tableList property.
     * 
     * @param value
     *     allowed object is
     *     {@link Product.TableList }
     *     
     */
    public void setTableList(Product.TableList value) {
        this.tableList = value;
    }

    /**
     * Gets the value of the name property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the value of the name property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setName(String value) {
        this.name = value;
    }

    /**
     * Gets the value of the version property.
     * 
     * @return
     *     possible object is
     *     {@link Float }
     *     
     */
    public Float getVersion() {
        return version;
    }

    /**
     * Sets the value of the version property.
     * 
     * @param value
     *     allowed object is
     *     {@link Float }
     *     
     */
    public void setVersion(Float value) {
        this.version = value;
    }

    /**
     * <p>Java class for anonymous complex type.
     * 
     * <p>The following schema fragment specifies the expected content contained within this class.
     * 
     * <pre>
     * &lt;complexType>
     *   &lt;complexContent>
     *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
     *       &lt;sequence>
     *         &lt;element name="Table" maxOccurs="unbounded" minOccurs="0">
     *           &lt;complexType>
     *             &lt;complexContent>
     *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
     *                 &lt;sequence>
     *                   &lt;element name="ColumnList">
     *                     &lt;complexType>
     *                       &lt;complexContent>
     *                         &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
     *                           &lt;sequence>
     *                             &lt;element name="Column" maxOccurs="unbounded" minOccurs="0">
     *                               &lt;complexType>
     *                                 &lt;simpleContent>
     *                                   &lt;extension base="&lt;http://www.w3.org/2001/XMLSchema>byte">
     *                                     &lt;attribute name="inputColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
     *                                     &lt;attribute name="simpeVatColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
     *                                     &lt;attribute name="setterMethod" type="{http://www.w3.org/2001/XMLSchema}string" />
     *                                   &lt;/extension>
     *                                 &lt;/simpleContent>
     *                               &lt;/complexType>
     *                             &lt;/element>
     *                           &lt;/sequence>
     *                         &lt;/restriction>
     *                       &lt;/complexContent>
     *                     &lt;/complexType>
     *                   &lt;/element>
     *                 &lt;/sequence>
     *                 &lt;attribute name="name" type="{http://www.w3.org/2001/XMLSchema}string" />
     *                 &lt;attribute name="srcFileName" type="{http://www.w3.org/2001/XMLSchema}string" />
     *                 &lt;attribute name="entityName" type="{http://www.w3.org/2001/XMLSchema}string" />
     *                 &lt;attribute name="serviceName" type="{http://www.w3.org/2001/XMLSchema}string" />
     *               &lt;/restriction>
     *             &lt;/complexContent>
     *           &lt;/complexType>
     *         &lt;/element>
     *       &lt;/sequence>
     *     &lt;/restriction>
     *   &lt;/complexContent>
     * &lt;/complexType>
     * </pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "", propOrder = {
        "table"
    })
    public static class TableList {

        @XmlElement(name = "Table")
        protected List<Product.TableList.Table> table;

        /**
         * Gets the value of the table property.
         * 
         * <p>
         * This accessor method returns a reference to the live list,
         * not a snapshot. Therefore any modification you make to the
         * returned list will be present inside the JAXB object.
         * This is why there is not a <CODE>set</CODE> method for the table property.
         * 
         * <p>
         * For example, to add a new item, do as follows:
         * <pre>
         *    getTable().add(newItem);
         * </pre>
         * 
         * 
         * <p>
         * Objects of the following type(s) are allowed in the list
         * {@link Product.TableList.Table }
         * 
         * 
         */
        public List<Product.TableList.Table> getTable() {
            if (table == null) {
                table = new ArrayList<Product.TableList.Table>();
            }
            return this.table;
        }

        /**
         * <p>Java class for anonymous complex type.
         * 
         * <p>The following schema fragment specifies the expected content contained within this class.
         * 
         * <pre>
         * &lt;complexType>
         *   &lt;complexContent>
         *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
         *       &lt;sequence>
         *         &lt;element name="ColumnList">
         *           &lt;complexType>
         *             &lt;complexContent>
         *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
         *                 &lt;sequence>
         *                   &lt;element name="Column" maxOccurs="unbounded" minOccurs="0">
         *                     &lt;complexType>
         *                       &lt;simpleContent>
         *                         &lt;extension base="&lt;http://www.w3.org/2001/XMLSchema>byte">
         *                           &lt;attribute name="inputColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
         *                           &lt;attribute name="simpeVatColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
         *                           &lt;attribute name="setterMethod" type="{http://www.w3.org/2001/XMLSchema}string" />
         *                         &lt;/extension>
         *                       &lt;/simpleContent>
         *                     &lt;/complexType>
         *                   &lt;/element>
         *                 &lt;/sequence>
         *               &lt;/restriction>
         *             &lt;/complexContent>
         *           &lt;/complexType>
         *         &lt;/element>
         *       &lt;/sequence>
         *       &lt;attribute name="name" type="{http://www.w3.org/2001/XMLSchema}string" />
         *       &lt;attribute name="srcFileName" type="{http://www.w3.org/2001/XMLSchema}string" />
         *       &lt;attribute name="entityName" type="{http://www.w3.org/2001/XMLSchema}string" />
         *       &lt;attribute name="serviceName" type="{http://www.w3.org/2001/XMLSchema}string" />
         *     &lt;/restriction>
         *   &lt;/complexContent>
         * &lt;/complexType>
         * </pre>
         * 
         * 
         */
        @XmlAccessorType(XmlAccessType.FIELD)
        @XmlType(name = "", propOrder = {
            "columnList"
        })
        public static class Table {

            @XmlElement(name = "ColumnList", required = true)
            protected Product.TableList.Table.ColumnList columnList;
            @XmlAttribute(name = "name")
            protected String name;
            @XmlAttribute(name = "srcFileName")
            protected String srcFileName;
            @XmlAttribute(name = "entityName")
            protected String entityName;
            @XmlAttribute(name = "serviceName")
            protected String serviceName;

            /**
             * Gets the value of the columnList property.
             * 
             * @return
             *     possible object is
             *     {@link Product.TableList.Table.ColumnList }
             *     
             */
            public Product.TableList.Table.ColumnList getColumnList() {
                return columnList;
            }

            /**
             * Sets the value of the columnList property.
             * 
             * @param value
             *     allowed object is
             *     {@link Product.TableList.Table.ColumnList }
             *     
             */
            public void setColumnList(Product.TableList.Table.ColumnList value) {
                this.columnList = value;
            }

            /**
             * Gets the value of the name property.
             * 
             * @return
             *     possible object is
             *     {@link String }
             *     
             */
            public String getName() {
                return name;
            }

            /**
             * Sets the value of the name property.
             * 
             * @param value
             *     allowed object is
             *     {@link String }
             *     
             */
            public void setName(String value) {
                this.name = value;
            }

            /**
             * Gets the value of the srcFileName property.
             * 
             * @return
             *     possible object is
             *     {@link String }
             *     
             */
            public String getSrcFileName() {
                return srcFileName;
            }

            /**
             * Sets the value of the srcFileName property.
             * 
             * @param value
             *     allowed object is
             *     {@link String }
             *     
             */
            public void setSrcFileName(String value) {
                this.srcFileName = value;
            }

            /**
             * Gets the value of the entityName property.
             * 
             * @return
             *     possible object is
             *     {@link String }
             *     
             */
            public String getEntityName() {
                return entityName;
            }

            /**
             * Sets the value of the entityName property.
             * 
             * @param value
             *     allowed object is
             *     {@link String }
             *     
             */
            public void setEntityName(String value) {
                this.entityName = value;
            }

            /**
             * Gets the value of the serviceName property.
             * 
             * @return
             *     possible object is
             *     {@link String }
             *     
             */
            public String getServiceName() {
                return serviceName;
            }

            /**
             * Sets the value of the serviceName property.
             * 
             * @param value
             *     allowed object is
             *     {@link String }
             *     
             */
            public void setServiceName(String value) {
                this.serviceName = value;
            }

            /**
             * <p>Java class for anonymous complex type.
             * 
             * <p>The following schema fragment specifies the expected content contained within this class.
             * 
             * <pre>
             * &lt;complexType>
             *   &lt;complexContent>
             *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
             *       &lt;sequence>
             *         &lt;element name="Column" maxOccurs="unbounded" minOccurs="0">
             *           &lt;complexType>
             *             &lt;simpleContent>
             *               &lt;extension base="&lt;http://www.w3.org/2001/XMLSchema>byte">
             *                 &lt;attribute name="inputColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
             *                 &lt;attribute name="simpeVatColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
             *                 &lt;attribute name="setterMethod" type="{http://www.w3.org/2001/XMLSchema}string" />
             *               &lt;/extension>
             *             &lt;/simpleContent>
             *           &lt;/complexType>
             *         &lt;/element>
             *       &lt;/sequence>
             *     &lt;/restriction>
             *   &lt;/complexContent>
             * &lt;/complexType>
             * </pre>
             * 
             * 
             */
            @XmlAccessorType(XmlAccessType.FIELD)
            @XmlType(name = "", propOrder = {
                "column"
            })
            public static class ColumnList {

                @XmlElement(name = "Column")
                protected List<Product.TableList.Table.ColumnList.Column> column;

                /**
                 * Gets the value of the column property.
                 * 
                 * <p>
                 * This accessor method returns a reference to the live list,
                 * not a snapshot. Therefore any modification you make to the
                 * returned list will be present inside the JAXB object.
                 * This is why there is not a <CODE>set</CODE> method for the column property.
                 * 
                 * <p>
                 * For example, to add a new item, do as follows:
                 * <pre>
                 *    getColumn().add(newItem);
                 * </pre>
                 * 
                 * 
                 * <p>
                 * Objects of the following type(s) are allowed in the list
                 * {@link Product.TableList.Table.ColumnList.Column }
                 * 
                 * 
                 */
                public List<Product.TableList.Table.ColumnList.Column> getColumn() {
                    if (column == null) {
                        column = new ArrayList<Product.TableList.Table.ColumnList.Column>();
                    }
                    return this.column;
                }

                /**
                 * <p>Java class for anonymous complex type.
                 * 
                 * <p>The following schema fragment specifies the expected content contained within this class.
                 * 
                 * <pre>
                 * &lt;complexType>
                 *   &lt;simpleContent>
                 *     &lt;extension base="&lt;http://www.w3.org/2001/XMLSchema>byte">
                 *       &lt;attribute name="inputColumn" type="{http://www.w3.org/2001/XMLSchema}string" />
                 *       &lt;attribute name="dataType" type="{http://www.w3.org/2001/XMLSchema}string" />
                 *       &lt;attribute name="setterMethod" type="{http://www.w3.org/2001/XMLSchema}string" />
                 *     &lt;/extension>
                 *   &lt;/simpleContent>
                 * &lt;/complexType>
                 * </pre>
                 * 
                 * 
                 */
                @XmlAccessorType(XmlAccessType.FIELD)
                @XmlType(name = "", propOrder = {
                    "value"
                })
                public static class Column {

                    @XmlValue
                    protected byte value;
                    @XmlAttribute(name = "inputColumn")
                    protected String inputColumn;
                    @XmlAttribute(name = "dataType")
                    protected String dataType;
                    @XmlAttribute(name = "setterMethod")
                    protected String setterMethod;

                    /**
                     * Gets the value of the value property.
                     * 
                     */
                    public byte getValue() {
                        return value;
                    }

                    /**
                     * Sets the value of the value property.
                     * 
                     */
                    public void setValue(byte value) {
                        this.value = value;
                    }

                    /**
                     * Gets the value of the inputColumn property.
                     * 
                     * @return
                     *     possible object is
                     *     {@link String }
                     *     
                     */
                    public String getInputColumn() {
                        return inputColumn;
                    }

                    /**
                     * Sets the value of the inputColumn property.
                     * 
                     * @param value
                     *     allowed object is
                     *     {@link String }
                     *     
                     */
                    public void setInputColumn(String value) {
                        this.inputColumn = value;
                    }

                    /**
                     * Gets the value of the simpeVatColumn property.
                     * 
                     * @return
                     *     possible object is
                     *     {@link String }
                     *     
                     */
                    public String getDataType() {
                        return dataType;
                    }

                    /**
                     * Sets the value of the simpeVatColumn property.
                     * 
                     * @param value
                     *     allowed object is
                     *     {@link String }
                     *     
                     */
                    public void setDataType(String value) {
                        this.dataType = value;
                    }

                    /**
                     * Gets the value of the setterMethod property.
                     * 
                     * @return
                     *     possible object is
                     *     {@link String }
                     *     
                     */
                    public String getSetterMethod() {
                        return setterMethod;
                    }

                    /**
                     * Sets the value of the setterMethod property.
                     * 
                     * @param value
                     *     allowed object is
                     *     {@link String }
                     *     
                     */
                    public void setSetterMethod(String value) {
                        this.setterMethod = value;
                    }

                }

            }

        }

    }

}

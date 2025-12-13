package com.simpleaccounts.repository;

import com.simpleaccounts.entity.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product,Integer> {

    List<Product> findAllByDeleteFlag(boolean deleteFlag);

    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) = LOWER(:productName) AND p.deleteFlag = :deleteFlag")
    List<Product> findByProductNameAndDeleteFlagIgnoreCase(@Param("productName") String productName, @Param("deleteFlag") boolean deleteFlag);

}

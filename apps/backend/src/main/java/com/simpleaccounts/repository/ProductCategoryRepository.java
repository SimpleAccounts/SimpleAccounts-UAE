package com.simpleaccounts.repository;

import com.simpleaccounts.entity.ProductCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory,Integer> {
    @Query("SELECT pc FROM ProductCategory pc WHERE pc.deleteFlag = false")
    List<ProductCategory> getProductCategories(@Param("name") String name);

}

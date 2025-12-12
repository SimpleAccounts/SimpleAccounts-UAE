package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import lombok.RequiredArgsConstructor;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ProductDao;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.ProductService;
import java.util.Map;

@Service("ProductService")
@RequiredArgsConstructor
public class ProductServiceImpl extends ProductService {

    private final ProductDao productDao;
    private final CacheManager cacheManager;

    @Override
    protected Dao<Integer, Product> getDao() {
        return productDao;
    }

    @Override
    public PaginationResponseModel getProductList(Map<ProductFilterEnum, Object> filterMap,PaginationModel paginationModel) {
        return productDao.getProductList(filterMap,paginationModel);
    }

    @Override
    public Product update(Product product) {
        Product productUpdated = super.update(product);
        deleteFromCache(Collections.singletonList(productUpdated.getProductID()));
        return productUpdated;
    }

    @Override
    public void deleteByIds(List<Integer> ids) {
       productDao.deleteByIds(ids);
       deleteFromCache(ids);
    }

    private void deleteFromCache(List<Integer> ids) {
        Cache productCache = cacheManager.getCache("productCache");
        for (Integer id : ids ) {
            productCache.evict(id);
        }
    }

    @Override
    @Cacheable(cacheNames = "productCache", key = "#productId")
    public Product findByPK(Integer productId) {
        return productDao.findByPK(productId);
    }
    @Override
    public Integer getTotalProductCountByVatId(Integer vatId){
        return productDao.getTotalProductCountByVatId(vatId);
    }
}

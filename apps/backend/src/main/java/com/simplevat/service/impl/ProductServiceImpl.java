package com.simplevat.service.impl;

import com.simplevat.constant.dbfilter.ProductFilterEnum;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import com.simplevat.dao.Dao;
import com.simplevat.dao.ProductDao;
import com.simplevat.entity.Product;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.ProductService;
import java.util.Map;

@Service("ProductService")
public class ProductServiceImpl extends ProductService {

    @Autowired
    private ProductDao productDao;
    @Autowired
    private CacheManager cacheManager;

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

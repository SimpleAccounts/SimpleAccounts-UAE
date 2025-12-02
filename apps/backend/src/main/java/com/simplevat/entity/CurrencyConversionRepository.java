package com.simplevat.entity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CurrencyConversionRepository extends JpaRepository<CurrencyConversion, Integer> {

    CurrencyConversion findByCurrencyCode(Currency currencyCode);
}
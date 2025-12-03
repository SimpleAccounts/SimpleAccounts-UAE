package com.simpleaccounts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.entity.PlaceOfSupply;

@Repository
public interface PlaceOfSupplyRepository extends JpaRepository<PlaceOfSupply, Integer> {

	PlaceOfSupply findByPlaceOfSupply(String val);
	
}	

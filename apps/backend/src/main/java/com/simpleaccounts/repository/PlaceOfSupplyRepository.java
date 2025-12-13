package com.simpleaccounts.repository;

import com.simpleaccounts.entity.PlaceOfSupply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaceOfSupplyRepository extends JpaRepository<PlaceOfSupply, Integer> {

	PlaceOfSupply findByPlaceOfSupply(String val);
	
}	

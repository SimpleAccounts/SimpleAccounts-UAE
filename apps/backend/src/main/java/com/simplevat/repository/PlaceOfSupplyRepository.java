package com.simplevat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.simplevat.entity.PlaceOfSupply;

@Repository
public interface PlaceOfSupplyRepository extends JpaRepository<PlaceOfSupply, Integer> {

	PlaceOfSupply findByPlaceOfSupply(String val);
	
}	

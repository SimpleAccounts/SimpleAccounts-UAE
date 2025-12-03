package com.simpleaccounts.entity.bankaccount;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface BankDetailsRepository extends JpaRepository<BankDetails, Long> {

	@Query(value = "SELECT BANK_NAME FROM bank_details", nativeQuery=true)
	List<String> getBankNameList();

	@Query(value = "SELECT * FROM bank_details b WHERE b.bank_name =:bankName", nativeQuery = true)
	List<BankDetails> getBankByBankName(String bankName);
}

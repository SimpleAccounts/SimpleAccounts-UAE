package com.simplevat.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OverDueAmountDetailsModel {

        private Float overDueAmount;
        private Float overDueAmountWeekly;
        private Float overDueAmountMonthly;

        public OverDueAmountDetailsModel(){

        }

        public OverDueAmountDetailsModel(Float overDueAmount, Float overDueAmountWeekly, Float overDueAmountMonthly) {
                this.overDueAmount = overDueAmount;
                this.overDueAmountWeekly = overDueAmountWeekly;
                this.overDueAmountMonthly = overDueAmountMonthly;
        }
}

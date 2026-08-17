package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "business_approvals")
public class BusinessApproval {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String companyName;

    private String contactPerson;
    private String email;
    private String phone;
    private String taxIdType;
    private String taxId;
    private String industry;
    private String tier = "Enterprise Tier";
    private String registrationDate;
    private String status = "Pending Approval"; // Pending Approval, Approved, Rejected

    @Column(length = 1024)
    private String address;

    private String verificationStatus;

    public BusinessApproval() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getTaxIdType() { return taxIdType; }
    public void setTaxIdType(String taxIdType) { this.taxIdType = taxIdType; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public String getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(String registrationDate) { this.registrationDate = registrationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
}

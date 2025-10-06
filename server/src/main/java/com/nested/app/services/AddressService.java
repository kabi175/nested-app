package com.nested.app.services;

import com.nested.app.dto.AddressDto;
import com.nested.app.entity.Address;
import com.nested.app.entity.Investor;
import com.nested.app.repository.AddressRepository;
import com.nested.app.repository.InvestorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Address entity operations
 * Handles business logic for address management
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final InvestorRepository investorRepository;

    /**
     * Create a new address for an investor
     * @param investorId investor ID
     * @param addressDto address data transfer object
     * @return created address DTO
     * @throws IllegalArgumentException if investor not found
     */
    public AddressDto createAddress(Long investorId, AddressDto addressDto) {
        log.info("Creating new address for investor ID: {}", investorId);
        
        try {
            // Validate investor exists
            Investor investor = investorRepository.findById(investorId)
                .orElseThrow(() -> new IllegalArgumentException("Investor not found with ID: " + investorId));
            
            Address address = AddressDto.toEntity(addressDto);

            Address savedAddress = addressRepository.save(address);
            
            log.info("Successfully created address with ID: {} for investor ID: {}", 
                    savedAddress.getId(), investorId);
            return AddressDto.fromEntity(savedAddress);
            
        } catch (Exception e) {
            log.error("Failed to create address for investor ID: {}. Error: {}", 
                     investorId, e.getMessage());
            throw e;
        }
    }

    /**
     * Update an existing address
     * @param addressId address ID
     * @param addressDto address data transfer object
     * @return updated address DTO
     * @throws IllegalArgumentException if address not found
     */
    public AddressDto updateAddress(Long addressId, AddressDto addressDto) {
        log.info("Updating address with ID: {}", addressId);
        
        try {
            Address existingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found with ID: " + addressId));
            
            // Update fields
            updateAddressFields(existingAddress, addressDto);
            
            Address updatedAddress = addressRepository.save(existingAddress);
            
            log.info("Successfully updated address with ID: {}", addressId);
            return AddressDto.fromEntity(updatedAddress);
            
        } catch (Exception e) {
            log.error("Failed to update address with ID: {}. Error: {}", addressId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get address by ID
     * @param addressId address ID
     * @return address DTO
     * @throws IllegalArgumentException if address not found
     */
    @Transactional(readOnly = true)
    public AddressDto getAddressById(Long addressId) {
        log.debug("Fetching address with ID: {}", addressId);
        
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new IllegalArgumentException("Address not found with ID: " + addressId));
        
        return AddressDto.fromEntity(address);
    }

    /**
     * Get all addresses with pagination
     * @param pageable pagination information
     * @return page of address DTOs
     */
    @Transactional(readOnly = true)
    public Page<AddressDto> getAllAddresses(Pageable pageable) {
        log.debug("Fetching all addresses with pagination: page {}, size {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        
        Page<Address> addresses = addressRepository.findAll(pageable);
        return addresses.map(AddressDto::fromEntity);
    }

    /**
     * Delete address by ID
     * @param addressId address ID
     * @throws IllegalArgumentException if address not found
     */
    public void deleteAddress(Long addressId) {
        log.info("Deleting address with ID: {}", addressId);
        
        try {
            if (!addressRepository.existsById(addressId)) {
                throw new IllegalArgumentException("Address not found with ID: " + addressId);
            }
            
            addressRepository.deleteById(addressId);
            log.info("Successfully deleted address with ID: {}", addressId);
            
        } catch (Exception e) {
            log.error("Failed to delete address with ID: {}. Error: {}", addressId, e.getMessage());
            throw e;
        }
    }

    /**
     * Check if address exists by ID
     * @param addressId address ID
     * @return true if address exists
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long addressId) {
        return addressRepository.existsById(addressId);
    }

    /**
     * Update address fields from DTO
     * @param address existing address entity
     * @param addressDto address DTO with new data
     */
    private void updateAddressFields(Address address, AddressDto addressDto) {
        if (addressDto.getAddressLine() != null) {
            address.setAddressLine(addressDto.getAddressLine());
        }
        if (addressDto.getCity() != null) {
            address.setCity(addressDto.getCity());
        }
        if (addressDto.getState() != null) {
            address.setState(addressDto.getState());
        }
        if (addressDto.getCountry() != null) {
            address.setCountry(addressDto.getCountry());
        }
        if (addressDto.getPinCode() != null) {
            address.setPinCode(addressDto.getPinCode());
        }
    }
}

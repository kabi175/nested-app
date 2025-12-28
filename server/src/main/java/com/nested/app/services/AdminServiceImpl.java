package com.nested.app.services;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.nested.app.dto.CreateAdminRequest;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.User;
import com.nested.app.exception.FirebaseException;
import com.nested.app.repository.UserRepository;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDTO createAdminUser(CreateAdminRequest request) {
        log.info("Creating admin user with request: {}", request);

        // Validate request
        if (!request.isValid()) {
            throw new IllegalArgumentException("Either email or firebaseUid must be provided");
        }

        String firebaseUid = request.getFirebaseUid();
        String email = request.getEmail();

        // If Firebase UID is provided, get user from Firebase
        if (firebaseUid != null && !firebaseUid.isEmpty()) {
            return createOrPromoteByUid(firebaseUid, request);
        }

        // If email is provided, get user from Firebase
        if (email != null && !email.isEmpty()) {
            return createOrPromoteByEmail(email, request);
        }

        throw new IllegalArgumentException("Either email or firebaseUid must be provided");
    }

    @Override
    @Transactional
    public UserDTO promoteToAdmin(Long userId) {
        log.info("Promoting user {} to admin", userId);

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new FirebaseException("User not found with ID: " + userId));

        if (user.getRole() == User.Role.ADMIN) {
            throw new IllegalArgumentException("User is already an admin");
        }

        // Update role
        user.setRole(User.Role.ADMIN);
        User savedUser = userRepository.save(user);

        // Set Firebase custom claims
        setFirebaseAdminClaims(user.getFirebaseUid());

        return mapToDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO demoteFromAdmin(Long userId) {
        log.info("Demoting user {} from admin", userId);

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new FirebaseException("User not found with ID: " + userId));

        if (user.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("User is not an admin");
        }

        // Update role
        user.setRole(User.Role.STANDARD);
        User savedUser = userRepository.save(user);

        // Remove Firebase admin claims
        removeFirebaseAdminClaims(user.getFirebaseUid());

        return mapToDTO(savedUser);
    }

    /**
     * Create or promote user by Firebase UID
     */
    private UserDTO createOrPromoteByUid(String firebaseUid, CreateAdminRequest request) {
        try {
            // Get user from Firebase
            UserRecord firebaseUser = FirebaseAuth.getInstance().getUser(firebaseUid);
            String email = firebaseUser.getEmail();

            // Check if user exists in database
            return userRepository.findByFirebaseUid(firebaseUid)
                    .map(existingUser -> {
                        if (existingUser.getRole() == User.Role.ADMIN) {
                            throw new IllegalArgumentException("User is already an admin");
                        }
                        return promoteExistingUser(existingUser, request);
                    })
                    .orElseGet(() -> createNewAdminUser(firebaseUid, email, request));

        } catch (FirebaseAuthException e) {
            log.error("Firebase user not found with UID: {}", firebaseUid, e);
      throw new FirebaseException("Firebase user not found with UID: " + firebaseUid);
        }
    }

    /**
     * Create or promote user by email
     */
    private UserDTO createOrPromoteByEmail(String email, CreateAdminRequest request) {
        try {
            // Get user from Firebase
            UserRecord firebaseUser = FirebaseAuth.getInstance().getUserByEmail(email);
            String firebaseUid = firebaseUser.getUid();

            // Check if user exists in database
            return userRepository.findByFirebaseUid(firebaseUid)
                    .map(existingUser -> {
                        if (existingUser.getRole() == User.Role.ADMIN) {
                            throw new IllegalArgumentException("User is already an admin");
                        }
                        return promoteExistingUser(existingUser, request);
                    })
                    .orElseGet(() -> createNewAdminUser(firebaseUid, email, request));

        } catch (FirebaseAuthException e) {
            log.error("Firebase user not found with email: {}", email, e);
      throw new FirebaseException(
          "Firebase user not found with email: "
              + email
              + ". Please create the user in Firebase Console first.");
        }
    }

    /**
     * Promotes an existing user to admin
     */
    private UserDTO promoteExistingUser(User existingUser, CreateAdminRequest request) {
        log.info("Promoting existing user {} to admin", existingUser.getId());

        existingUser.setRole(User.Role.ADMIN);

        // Update optional fields if provided
        if (request.getFirstName() != null && !request.getFirstName().isEmpty()) {
            existingUser.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isEmpty()) {
            existingUser.setLastName(request.getLastName());
        }

        User savedUser = userRepository.save(existingUser);

        // Set Firebase custom claims
        setFirebaseAdminClaims(savedUser.getFirebaseUid());

        return mapToDTO(savedUser);
    }

    /**
     * Creates a new admin user in the database
     */
    private UserDTO createNewAdminUser(String firebaseUid, String email, CreateAdminRequest request) {
        log.info("Creating new admin user: {}", email);

        User newAdmin = User.builder()
                .firebaseUid(firebaseUid)
                .email(email)
                .role(User.Role.ADMIN)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(newAdmin);

        // Set Firebase custom claims
        setFirebaseAdminClaims(firebaseUid);

        return mapToDTO(savedUser);
    }

    /**
     * Sets Firebase custom claims for admin role
     */
    private void setFirebaseAdminClaims(String firebaseUid) {
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("admin", true);
            claims.put("role", "ADMIN");
            FirebaseAuth.getInstance().setCustomUserClaims(firebaseUid, claims);
            log.info("Firebase admin claims set for UID: {}", firebaseUid);
        } catch (FirebaseAuthException e) {
            log.error("Failed to set Firebase custom claims for UID: {}", firebaseUid, e);
      throw new FirebaseException("Failed to set Firebase admin claims: " + e.getMessage());
        }
    }

    /**
     * Removes Firebase admin custom claims
     */
    private void removeFirebaseAdminClaims(String firebaseUid) {
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("admin", false);
            claims.put("role", "USER");
            FirebaseAuth.getInstance().setCustomUserClaims(firebaseUid, claims);
            log.info("Firebase admin claims removed for UID: {}", firebaseUid);
        } catch (FirebaseAuthException e) {
            log.error("Failed to remove Firebase custom claims for UID: {}", firebaseUid, e);
      throw new FirebaseException("Failed to remove Firebase admin claims: " + e.getMessage());
        }
    }

    /**
     * Maps User entity to UserDTO
     */
    private UserDTO mapToDTO(User user) {
        return UserDTO.fromEntity(user);
    }
}


package com.demo.controller.v1;

import com.demo.dto.CarRequest;
import com.demo.dto.MessageResponse;
import com.demo.entity.Car;
import com.demo.repository.CarRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/cars")
public class CarController {

    @Autowired
    CarRepository carRepository;

    @GetMapping
    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCarById(@PathVariable Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Car not found."));
        return ResponseEntity.ok(car);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCar(@Valid @RequestBody CarRequest carRequest) {
        Car car = Car.builder()
                .model(carRequest.getModel())
                .brand(carRequest.getBrand())
                .year(carRequest.getYear())
                .pricePerDay(carRequest.getPricePerDay())
                .build();

        carRepository.save(car);
        return ResponseEntity.ok(new MessageResponse("Car added successfully!"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCar(@PathVariable Long id, @Valid @RequestBody CarRequest carRequest) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Car not found."));

        car.setModel(carRequest.getModel());
        car.setBrand(carRequest.getBrand());
        car.setYear(carRequest.getYear());
        car.setPricePerDay(carRequest.getPricePerDay());

        carRepository.save(car);
        return ResponseEntity.ok(new MessageResponse("Car updated successfully!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        carRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Car deleted successfully!"));
    }
}

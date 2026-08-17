package om.gov.moh.minutes.controller;

import java.util.List;
import om.gov.moh.minutes.dto.AdminStatsDto;
import om.gov.moh.minutes.dto.CreateUserRequest;
import om.gov.moh.minutes.dto.MinuteDto;
import om.gov.moh.minutes.dto.MinuteSearchRequest;
import om.gov.moh.minutes.dto.PageResponse;
import om.gov.moh.minutes.dto.UpdateEnabledRequest;
import om.gov.moh.minutes.dto.UpdateRoleRequest;
import om.gov.moh.minutes.dto.UserDto;
import om.gov.moh.minutes.dto.UserSearchRequest;
import om.gov.moh.minutes.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  @Autowired
  private AdminService adminService;

  @GetMapping("/users")
  public List<UserDto> users() {
    return adminService.listUsers();
  }

  @PostMapping("/users/search")
  public PageResponse<UserDto> searchUsers(@RequestBody UserSearchRequest request) {
    return adminService.searchUsers(request);
  }

  @PostMapping("/users")
  @ResponseStatus(HttpStatus.CREATED)
  public UserDto createUser(@RequestBody CreateUserRequest request) {
    return adminService.createUser(request);
  }

  @PutMapping("/users/{id}/role")
  public UserDto updateRole(@PathVariable String id, @RequestBody UpdateRoleRequest request) {
    return adminService.updateRole(id, request.getRole());
  }

  @PutMapping("/users/{id}/enabled")
  public UserDto updateEnabled(
      @PathVariable String id, @RequestBody UpdateEnabledRequest request) {
    return adminService.updateEnabled(id, request.isEnabled());
  }

  @GetMapping("/stats")
  public AdminStatsDto stats() {
    return adminService.stats();
  }

  @GetMapping("/minutes")
  public List<MinuteDto> minutes(
      @RequestParam(required = false) String title,
      @RequestParam(required = false) String user,
      @RequestParam(required = false) String dateFrom,
      @RequestParam(required = false) String dateTo) {
    return adminService.searchMinutes(title, user, dateFrom, dateTo);
  }

  @PostMapping("/minutes/search")
  public PageResponse<MinuteDto> searchMinutes(@RequestBody MinuteSearchRequest request) {
    return adminService.searchMinutes(request);
  }
}

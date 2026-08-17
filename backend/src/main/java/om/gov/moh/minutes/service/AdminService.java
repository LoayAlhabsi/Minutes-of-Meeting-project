package om.gov.moh.minutes.service;

import java.util.List;
import om.gov.moh.minutes.dto.AdminStatsDto;
import om.gov.moh.minutes.dto.CreateUserRequest;
import om.gov.moh.minutes.dto.MinuteDto;
import om.gov.moh.minutes.dto.MinuteSearchRequest;
import om.gov.moh.minutes.dto.PageResponse;
import om.gov.moh.minutes.dto.UserDto;
import om.gov.moh.minutes.dto.UserSearchRequest;

public interface AdminService {
  List<UserDto> listUsers();

  PageResponse<UserDto> searchUsers(UserSearchRequest request);

  UserDto createUser(CreateUserRequest request);

  UserDto updateRole(String userId, String role);

  UserDto updateEnabled(String userId, boolean enabled);

  AdminStatsDto stats();

  List<MinuteDto> searchMinutes(String title, String user, String dateFrom, String dateTo);

  PageResponse<MinuteDto> searchMinutes(MinuteSearchRequest request);
}

using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Adopaws.Application.Mappings;
using Adopaws.Domain.Entities;

namespace Adopaws.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(UserMapper.ToDto);
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user is null ? null : UserMapper.ToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Password = dto.Password, // Hash in future auth implementation
            Phone = dto.Phone,
            Region = dto.Region,
            UserType = dto.UserType,
            ProfileDescription = dto.ProfileDescription,
            ProfileImage = dto.ProfileImage,
            RegistrationDate = DateTime.UtcNow,
            Status = "Active",
            IsVerified = false
        };

        var created = await _userRepository.CreateAsync(user);
        return UserMapper.ToDto(created);
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null) return null;

        user.FullName = dto.FullName;
        user.Phone = dto.Phone;
        user.Region = dto.Region;
        user.ProfileDescription = dto.ProfileDescription;
        user.ProfileImage = dto.ProfileImage;
        user.Status = dto.Status;

        var updated = await _userRepository.UpdateAsync(user);
        return UserMapper.ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null) return false;

        await _userRepository.DeleteAsync(id);
        return true;
    }
}

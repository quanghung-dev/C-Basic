init db: dotnet ef migrations add InitialCreate
migration : dotnet ef database update

DB.model.
TolistAsync : get all
FirstAsync : get first , k có thì trả lỗi
FirstOrDefaultAsync : get first , k có thì báo null
FindAsync(id) : tìm theo đk
AnyAsync : check tồn tại
MaxAsync and MinAsync


Add(product), update , remove ...
SaveChangesAsync : giống setchangeinfo 

IsNullOrWhiteSpace : true nếu là null , false nếu có dữ liệu
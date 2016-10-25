
void func(int count)
{
  if(count <= 0){
    return;
  }
  printf count;
  func(count - 1);
}

int main()
{
  func(10);
  return 0;
}

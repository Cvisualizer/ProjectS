
int n;

int mul(int x, int y, int z, int xyz)
{
  int a;
  int b;
  a = 10;
  b = 5;
  return x + y + a * b;
}

int main()
{
  n = 2;
  printf mul(10, 10, 10, 5) * n;
  return 0;
}

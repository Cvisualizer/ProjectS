
int a;
int f(int n)
{
  if(n <= 1){
    n = n * n;
    return 1;
  }else{
    n =  n * f(n - 1);
    return n;
  }
}

void main()
{
  printf f(10);
}

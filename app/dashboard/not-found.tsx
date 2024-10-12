export default function NotFoundSite() {
  return (
    <div className="mt-20 flex flex-col items-center space-x-4">
      <h1 className="text-4xl dark:text-white">404</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400">
        Site does not exist, or you do not have permission to view it
      </p>
    </div>
  );
}

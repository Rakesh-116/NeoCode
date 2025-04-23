const BlogCard = ({ blogDetails, onBlogSelect }) => {
  const { id, title, tags, username, created_at } = blogDetails;

  return (
    <button
      className="bg-black/70 hover:bg-white/5 border border-white/30 text-white/80 hover:text-white transition ease-out duration-300 p-4 rounded-lg mb-4 shadow-md flex justify-between items-center cursor-pointer w-full"
      onClick={() => onBlogSelect(id)}
    >
      <div className="flex flex-col items-start">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-2 text-sm text-gray-400">
          Tags: {Array.isArray(tags) ? tags.join(", ") : tags}
        </div>
      </div>
      <div className="mt-1 text-sm text-gray-300">
        <p>Author: {username}</p>
        <p className="">
          Posted on: {new Date(created_at).toLocaleDateString()}
        </p>
      </div>
    </button>
  );
};

export default BlogCard;
